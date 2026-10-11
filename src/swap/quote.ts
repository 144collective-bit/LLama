import type { Address, PublicClient } from 'viem'
import { routerAbi } from './abi'
import { NETWORK } from './network'
import type { CheckedRouter } from './router'
import { ROUTING_HUBS, type SwapToken } from './tokens'

export type Quote =
  | { kind: 'wrap'; amountIn: bigint; amountOut: bigint }
  | { kind: 'unwrap'; amountIn: bigint; amountOut: bigint }
  | {
      kind: 'swap'
      router: CheckedRouter
      path: Address[]
      amountIn: bigint
      amountOut: bigint
      /** Percent, or null when it can't be estimated. */
      priceImpact: number | null
    }

const wrappedAddress = (t: SwapToken) => t.address ?? NETWORK.wpls

async function amountsOut(client: PublicClient, router: Address, amountIn: bigint, path: Address[]) {
  try {
    const amounts = await client.readContract({
      address: router,
      abi: routerAbi,
      functionName: 'getAmountsOut',
      args: [amountIn, path],
    })
    return amounts[amounts.length - 1]
  } catch {
    // No pair (or no liquidity) for this path on this router.
    return null
  }
}

/**
 * Live quote: asks every checked router for the direct path and the paths
 * through the hub tokens, and returns the one that pays out the most. Null when
 * no router has liquidity for the pair.
 */
export async function getBestQuote(
  client: PublicClient,
  routers: CheckedRouter[],
  from: SwapToken,
  to: SwapToken,
  amountIn: bigint,
): Promise<Quote | null> {
  const inAddr = wrappedAddress(from)
  const outAddr = wrappedAddress(to)

  if (inAddr === outAddr) {
    // PLS ⇄ WPLS is a 1:1 wrap on the WPLS contract, not a trade.
    if (from.address === null && to.address === NETWORK.wpls) return { kind: 'wrap', amountIn, amountOut: amountIn }
    if (from.address === NETWORK.wpls && to.address === null) return { kind: 'unwrap', amountIn, amountOut: amountIn }
    return null
  }

  // Direct, then through one hub token, then through WPLS and PLSX together:
  // most PulseChain tokens are paired with one of these.
  const hubs = ROUTING_HUBS.filter((h) => h !== inAddr && h !== outAddr)
  const paths: Address[][] = [[inAddr, outAddr], ...hubs.map((h) => [inAddr, h, outAddr])]
  const [wpls, plsx] = ROUTING_HUBS
  if (plsx && hubs.includes(wpls) && hubs.includes(plsx)) paths.push([inAddr, wpls, plsx, outAddr], [inAddr, plsx, wpls, outAddr])

  const candidates = await Promise.all(
    routers.flatMap((router) =>
      paths.map(async (path) => ({ router, path, amountOut: await amountsOut(client, router.router, amountIn, path) })),
    ),
  )
  const best = candidates
    .filter((c): c is typeof c & { amountOut: bigint } => c.amountOut !== null && c.amountOut > 0n)
    .sort((a, b) => (b.amountOut > a.amountOut ? 1 : b.amountOut < a.amountOut ? -1 : 0))[0]
  if (!best) return null

  // Price impact: compare the rate for this trade with the rate for a trade
  // 1/10,000th its size, which barely moves the pool.
  let priceImpact: number | null = null
  const smallIn = amountIn / 10_000n
  if (smallIn > 0n) {
    const smallOut = await amountsOut(client, best.router.router, smallIn, best.path)
    if (smallOut && smallOut > 0n) {
      const ratio = (Number(best.amountOut) * Number(smallIn)) / (Number(amountIn) * Number(smallOut))
      priceImpact = Math.max(0, (1 - ratio) * 100)
    }
  }

  return { kind: 'swap', router: best.router, path: best.path, amountIn, amountOut: best.amountOut, priceImpact }
}
