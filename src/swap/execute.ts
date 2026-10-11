import {
  BaseError,
  encodeFunctionData,
  numberToHex,
  type Abi,
  type Address,
  type EstimateContractGasParameters,
  type Hash,
  type PublicClient,
  type WalletClient,
} from 'viem'
import { erc20Abi, routerAbi, wplsAbi } from './abi'
import { NETWORK, swapChain } from './network'
import type { Quote } from './quote'
import type { SwapToken } from './tokens'

export type SwapStep = 'approve' | 'swap'

interface ExecuteArgs {
  publicClient: PublicClient
  walletClient: WalletClient
  account: Address
  from: SwapToken
  /** True when the receive token is native PLS (not WPLS). */
  receivesNative: boolean
  quote: Quote
  slippageBps: bigint
  deadlineMinutes: number
  onStep: (step: SwapStep, hash?: Hash) => void
}

/** The parts of a simulateContract request needed to send it. */
interface SimulatedCall {
  address: Address
  abi: Abi
  functionName: string
  args?: readonly unknown[]
  value?: bigint
}

/**
 * Puts the wallet on PulseChain before anything is sent, adding the network
 * first if the wallet doesn't know it yet.
 */
async function ensureChain(walletClient: WalletClient) {
  if ((await walletClient.getChainId()) === swapChain.id) return
  try {
    await walletClient.switchChain({ id: swapChain.id })
  } catch (err) {
    // 4902 is the standard "add this network first"; some wallets only say so in words.
    const unknownChain =
      err instanceof BaseError &&
      !!err.walk((e) => (e as { code?: unknown }).code === 4902 || /unrecognized chain|unknown chain/i.test((e as Error).message))
    if (!unknownChain) throw err
    await walletClient.addChain({ chain: swapChain })
    if ((await walletClient.getChainId()) !== swapChain.id) await walletClient.switchChain({ id: swapChain.id })
  }
}

async function confirm(publicClient: PublicClient, hash: Hash) {
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== 'success') throw new Error('The transaction reverted on-chain.')
}

/**
 * Sends the swap from the user's own wallet. Every transaction is simulated
 * first, so a call that would fail (wrong contract, slippage, missing
 * function) stops here instead of costing gas. Approvals cover exactly the
 * amount being swapped, never unlimited.
 */
export async function executeSwap({
  publicClient,
  walletClient,
  account,
  from,
  receivesNative,
  quote,
  slippageBps,
  deadlineMinutes,
  onStep,
}: ExecuteArgs): Promise<Hash> {
  // Set the gas limit ourselves (estimate + 50%) rather than trusting every
  // wallet to estimate it: too low a limit makes the swap revert and still
  // costs gas, while unused gas is never charged. A first purchase of a token
  // costs noticeably more than the estimate suggests.
  const gasFor = async (request: EstimateContractGasParameters) =>
    ((await publicClient.estimateContractGas(request)) * 15n) / 10n
  // Sent to the wallet as written here, with every field filled in:
  // - `chainId`, so the wallet opens the request on PulseChain instead of
  //   whichever network it last used (viem leaves it out for browser wallets);
  // - `value`, 0 when no PLS is paid. Left out, the Rabby phone app's browser
  //   never opens its confirmation sheet for approvals and token sales.
  const send = async (request: SimulatedCall): Promise<Hash> => {
    const gas = await gasFor(request as EstimateContractGasParameters)
    await ensureChain(walletClient)
    return walletClient.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: account,
          to: request.address,
          data: encodeFunctionData({ abi: request.abi, functionName: request.functionName, args: request.args }),
          value: numberToHex(request.value ?? 0n),
          gas: numberToHex(gas),
          chainId: numberToHex(swapChain.id),
        },
      ],
    })
  }
  const sent = async (hash: Hash, step: SwapStep) => {
    onStep(step, hash)
    await confirm(publicClient, hash)
    return hash
  }

  if (quote.kind === 'wrap') {
    onStep('swap')
    const { request } = await publicClient.simulateContract({
      account,
      address: NETWORK.wpls,
      abi: wplsAbi,
      functionName: 'deposit',
      value: quote.amountIn,
    })
    return sent(await send(request), 'swap')
  }

  if (quote.kind === 'unwrap') {
    onStep('swap')
    const { request } = await publicClient.simulateContract({
      account,
      address: NETWORK.wpls,
      abi: wplsAbi,
      functionName: 'withdraw',
      args: [quote.amountIn],
    })
    return sent(await send(request), 'swap')
  }

  const router = quote.router.router
  const path = quote.path

  if (from.address) {
    const allowance = await publicClient.readContract({
      address: from.address,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [account, router],
    })
    if (allowance < quote.amountIn) {
      onStep('approve')
      const { request } = await publicClient.simulateContract({
        account,
        address: from.address,
        abi: erc20Abi,
        functionName: 'approve',
        args: [router, quote.amountIn],
      })
      await sent(await send(request), 'approve')
    }
  }

  onStep('swap')
  const amountOutMin = (quote.amountOut * (10_000n - slippageBps)) / 10_000n
  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60)

  if (!from.address) {
    const { request } = await publicClient.simulateContract({
      account,
      address: router,
      abi: routerAbi,
      functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
      args: [amountOutMin, path, account, deadline],
      value: quote.amountIn,
    })
    return sent(await send(request), 'swap')
  }

  // Paying out the native coin: the path ends at WPLS but the receive token is PLS.
  if (path[path.length - 1] === NETWORK.wpls && receivesNative) {
    const { request } = await publicClient.simulateContract({
      account,
      address: router,
      abi: routerAbi,
      functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
      args: [quote.amountIn, amountOutMin, path, account, deadline],
    })
    return sent(await send(request), 'swap')
  }

  const { request } = await publicClient.simulateContract({
    account,
    address: router,
    abi: routerAbi,
    functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    args: [quote.amountIn, amountOutMin, path, account, deadline],
  })
  return sent(await send(request), 'swap')
}
