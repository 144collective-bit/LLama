import { TOKEN } from '../token'
import type { SwapToken } from './tokens'

export interface Quote {
  amountOut: number
  /** Units of `to` per one unit of `from`. */
  rate: number
  /** Percent, e.g. 0.42 for 0.42%. */
  priceImpact: number
  /** Symbols from input to output. */
  route: string[]
  /** Percent taken by liquidity providers. */
  lpFeePercent: number
  amountInUsd: number
  amountOutUsd: number
}

export interface QuoteRequest {
  from: SwapToken
  to: SwapToken
  amountIn: number
}

/**
 * MOCK. Every number this returns is made up so the interface has something to
 * show. To go live, replace the body with a call to the LLamaswap (or PulseX)
 * router, e.g. `getAmountsOut(amountIn, path)`, and real USD prices; the page
 * only depends on this signature.
 */
export async function getQuote({ from, to, amountIn }: QuoteRequest): Promise<Quote> {
  await new Promise((resolve) => setTimeout(resolve, 300))

  const priceIn = MOCK_USD[from.symbol] ?? 1
  const priceOut = MOCK_USD[to.symbol] ?? 1
  const amountInUsd = amountIn * priceIn
  const priceImpact = Math.min(25, (amountInUsd / MOCK_POOL_USD) * 100)
  const afterFee = amountInUsd * (1 - MOCK_LP_FEE_PERCENT / 100)
  const amountOutUsd = afterFee * (1 - priceImpact / 100)
  const amountOut = amountOutUsd / priceOut

  const usesWrapped = from.address !== null && to.address !== null && from.symbol !== 'WPLS' && to.symbol !== 'WPLS'

  return {
    amountOut,
    rate: priceIn / priceOut,
    priceImpact,
    route: usesWrapped ? [from.symbol, 'WPLS', to.symbol] : [from.symbol, to.symbol],
    lpFeePercent: MOCK_LP_FEE_PERCENT,
    amountInUsd,
    amountOutUsd,
  }
}

const MOCK_LP_FEE_PERCENT = 0.29
const MOCK_POOL_USD = 250_000

const MOCK_USD: Record<string, number> = {
  PLS: 0.00004,
  WPLS: 0.00004,
  [TOKEN.ticker]: 0.000002,
  PLSX: 0.00002,
  HEX: 0.004,
  INC: 0.8,
  DAI: 1,
  USDC: 1,
}
