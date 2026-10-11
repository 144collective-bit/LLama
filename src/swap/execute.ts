import { encodeFunctionData, type Abi, type Address, type EstimateContractGasParameters, type Hash, type PublicClient, type WalletClient } from 'viem'
import { erc20Abi, routerAbi, wplsAbi } from './abi'
import { NETWORK } from './network'
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
  const chain = walletClient.chain
  // Set the gas limit ourselves (estimate + 50%) rather than trusting every
  // wallet to estimate it: too low a limit makes the swap revert and still
  // costs gas, while unused gas is never charged. A first purchase of a token
  // costs noticeably more than the estimate suggests.
  const gasFor = async (request: EstimateContractGasParameters) =>
    ((await publicClient.estimateContractGas(request)) * 15n) / 10n
  // Always send `value`, 0 when no PLS is paid. Approvals and token sales
  // otherwise leave the field out, which the standard allows but the Rabby
  // phone app's browser doesn't handle: its confirmation sheet never opens.
  const send = async (request: SimulatedCall) =>
    walletClient.sendTransaction({
      account,
      chain,
      to: request.address,
      data: encodeFunctionData({ abi: request.abi, functionName: request.functionName, args: request.args }),
      value: request.value ?? 0n,
      gas: await gasFor(request as EstimateContractGasParameters),
    })
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
