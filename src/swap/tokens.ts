import { getAddress, type Address } from 'viem'
import { TOKEN } from '../token'
import { NETWORK } from './network'

export interface SwapToken {
  symbol: string
  name: string
  /** Contract address; null for the native coin (PLS). */
  address: Address | null
  /** Fallback only: the real value is read from the contract before quoting. */
  decimals: number
  /** False while the token can't be traded yet ($LLAMA before launch). */
  tradable: boolean
  /** Path under public/ (see public/tokens/README.md). */
  logo?: string
  /** Fallback letter colour if the logo is missing or fails to load. */
  color: string
}

/**
 * PulseChain mainnet addresses. VERIFY each one on https://scan.pulsechain.com
 * before setting ADDRESSES_VERIFIED in network.ts: a wrong address can send
 * buyers to a fake token.
 */
const MAINNET: Record<string, Address> = {
  WPLS: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  PLSX: '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab',
  HEX: '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39',
  INC: '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d',
  DAI: '0xefD766cCb38EaF1dfd701853BFCe31359239F305',
  USDC: '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07',
}

function address(symbol: string): Address {
  return getAddress(NETWORK.tokens[symbol] ?? MAINNET[symbol])
}

export const TOKENS: SwapToken[] = [
  { symbol: 'PLS', name: 'Pulse', address: null, decimals: 18, tradable: true, logo: '/tokens/wpls.png', color: '#a855f7' },
  {
    symbol: TOKEN.ticker,
    name: TOKEN.name,
    address: getAddress(NETWORK.tokens[TOKEN.ticker] ?? TOKEN.contractAddress),
    decimals: 18,
    tradable: TOKEN.live || TOKEN.ticker in NETWORK.tokens,
    color: '#ffffff',
  },
  { symbol: 'WPLS', name: 'Wrapped Pulse', address: NETWORK.wpls, decimals: 18, tradable: true, logo: '/tokens/wpls.png', color: '#7c3aed' },
  { symbol: 'PLSX', name: 'PulseX', address: address('PLSX'), decimals: 18, tradable: true, logo: '/tokens/plsx.png', color: '#22d3ee' },
  { symbol: 'HEX', name: 'HEX', address: address('HEX'), decimals: 8, tradable: true, logo: '/tokens/hex.png', color: '#f97316' },
  { symbol: 'INC', name: 'Incentive', address: address('INC'), decimals: 18, tradable: true, logo: '/tokens/inc.png', color: '#84cc16' },
  { symbol: 'DAI', name: 'Dai from Ethereum', address: address('DAI'), decimals: 18, tradable: true, logo: '/tokens/dai.png', color: '#facc15' },
  { symbol: 'USDC', name: 'USD Coin from Ethereum', address: address('USDC'), decimals: 6, tradable: true, logo: '/tokens/usdc.png', color: '#3b82f6' },
]

const bySymbol = (s: string) => TOKENS.find((t) => t.symbol === s)!

/** Opens on PLS → $LLAMA once it's live, PLS → PLSX until then. */
export const DEFAULT_FROM = bySymbol('PLS')
export const DEFAULT_TO = bySymbol(TOKEN.live ? TOKEN.ticker : 'PLSX')
