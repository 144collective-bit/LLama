import { TOKEN } from '../token'

export interface SwapToken {
  symbol: string
  name: string
  /** Contract address on PulseChain; null for the native coin. Empty until filled in. */
  address: string | null
  decimals: number
  /** Accent for the placeholder logo until real token logos are added. */
  color: string
}

/**
 * Tokens offered in the picker. Addresses other than $LLAMA are left empty on
 * purpose: fill them from the PulseChain explorer when wiring up real quotes.
 */
export const TOKENS: SwapToken[] = [
  { symbol: 'PLS', name: 'Pulse', address: null, decimals: 18, color: '#a855f7' },
  { symbol: TOKEN.ticker, name: TOKEN.name, address: TOKEN.contractAddress, decimals: 18, color: '#ffffff' },
  { symbol: 'WPLS', name: 'Wrapped Pulse', address: '', decimals: 18, color: '#7c3aed' },
  { symbol: 'PLSX', name: 'PulseX', address: '', decimals: 18, color: '#22d3ee' },
  { symbol: 'HEX', name: 'HEX', address: '', decimals: 8, color: '#f97316' },
  { symbol: 'INC', name: 'Incentive', address: '', decimals: 18, color: '#84cc16' },
  { symbol: 'DAI', name: 'Dai from Ethereum', address: '', decimals: 18, color: '#facc15' },
  { symbol: 'USDC', name: 'USD Coin from Ethereum', address: '', decimals: 6, color: '#3b82f6' },
]

export const DEFAULT_FROM = TOKENS[0]
export const DEFAULT_TO = TOKENS[1]
