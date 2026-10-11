import { isAddressEqual, type PublicClient } from 'viem'
import { routerAbi } from './abi'
import { NETWORK, type DexRouter } from './network'

export interface CheckedRouter extends DexRouter {
  /** How the router spells the native coin in its function names. */
  native: 'ETH' | 'PLS'
}

/**
 * Before any quote or swap, confirm on-chain that each router is a contract,
 * belongs to the configured factory and wraps the configured WPLS. A router
 * that fails is dropped; if all fail, swapping is blocked.
 */
export async function checkRouters(client: PublicClient) {
  const ok: CheckedRouter[] = []
  const problems: string[] = []

  for (const r of NETWORK.routers) {
    try {
      const code = await client.getCode({ address: r.router })
      if (!code || code === '0x') throw new Error('no contract at the router address')

      const factory = await client
        .readContract({ address: r.router, abi: routerAbi, functionName: 'factory' })
        .catch(() => {
          throw new Error('the address is a contract but not a swap router')
        })
      if (!isAddressEqual(factory, r.factory)) throw new Error(`factory is ${factory}, expected ${r.factory}`)

      let native: CheckedRouter['native'] = 'PLS'
      let wrapped = await client
        .readContract({ address: r.router, abi: routerAbi, functionName: 'WPLS' })
        .catch(() => null)
      if (!wrapped) {
        native = 'ETH'
        wrapped = await client.readContract({ address: r.router, abi: routerAbi, functionName: 'WETH' })
      }
      if (!isAddressEqual(wrapped, NETWORK.wpls)) throw new Error(`wraps ${wrapped}, expected ${NETWORK.wpls}`)

      ok.push({ ...r, native })
    } catch (err) {
      problems.push(`${r.name}: ${err instanceof Error ? err.message.split('\n')[0] : String(err)}`)
    }
  }
  return { ok, problems }
}
