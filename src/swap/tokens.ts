import { getAddress, type Address } from 'viem'
import { TOKEN } from '../token'
import { NETWORK } from './network'
import tokenList from './tokenlist.json'

export interface SwapToken {
  symbol: string
  name: string
  /** Contract address; null for the native coin (PLS). Tokens are told apart by this, never by symbol. */
  address: Address | null
  /** Fallback only: the real value is read from the contract before quoting. */
  decimals: number
  /** False while the token can't be traded yet ($LLAMA before launch). */
  tradable: boolean
  /** Path under public/ (see public/tokens/README.md). */
  logo?: string
  /** Fallback letter colour if the logo is missing or fails to load. */
  color: string
  /** The main PulseChain tokens, listed first and marked in the picker. */
  core?: boolean
  /** Added by the visitor by pasting its address; not on the token list. */
  imported?: boolean
}

/**
 * The main tokens, listed first. Addresses checked on https://scan.pulsechain.com
 * and against the Piteas list. Copycats with the same symbols exist (e.g.
 * "PulseX from pump.tires"), so these are matched by address only.
 */
const CORE: Address[] = [
  '0xA1077a294dDE1B09bB078844df40758a5D0f9a27', // WPLS
  '0x95B303987A60C71504D99Aa1b13B4DA07b0790ab', // PLSX
  '0x2b591e99afE9f32eAA6214f7B7629768c40Eeb39', // HEX
  '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d', // INC
  '0xefD766cCb38EaF1dfd701853BFCe31359239F305', // DAI from Ethereum
  '0x15D38573d2feeb82e7ad5187aB8c1D52810B1f07', // USDC from Ethereum
]

const logoFor = (address: Address) => `/tokens/${address.toLowerCase()}.webp`

/** A stable colour per address for the letter shown when a token has no logo. */
const colorFor = (address: Address) => `hsl(${parseInt(address.slice(2, 8), 16) % 360} 70% 62%)`

type ListRow = [address: string, symbol: string, name: string, decimals: number, hasLogo: number]

/** Every token on the Piteas PulseChain list (snapshot in tokenlist.json), in list order. */
const LISTED: SwapToken[] = (tokenList.tokens as ListRow[]).map(([raw, symbol, name, decimals, hasLogo]) => {
  const address = getAddress(raw)
  return {
    symbol,
    name,
    address,
    decimals,
    tradable: true,
    logo: hasLogo ? logoFor(address) : undefined,
    color: colorFor(address),
    core: CORE.includes(address),
  }
})

const PLS: SwapToken = {
  symbol: 'PLS',
  name: 'Pulse',
  address: null,
  decimals: 18,
  tradable: true,
  logo: logoFor(CORE[0]),
  color: '#a855f7',
  core: true,
}

export const LLAMA: SwapToken = {
  symbol: TOKEN.ticker,
  name: TOKEN.name,
  address: getAddress(NETWORK.tokens[TOKEN.ticker] ?? TOKEN.contractAddress),
  decimals: 18,
  tradable: TOKEN.live || TOKEN.ticker in NETWORK.tokens,
  color: '#ffffff',
  core: true,
}

const coreFirst = (tokens: SwapToken[]) => [
  ...CORE.map((a) => tokens.find((t) => t.address === a)).filter((t): t is SwapToken => !!t),
  ...tokens.filter((t) => !t.core),
]

/**
 * On a test chain (VITE_SWAP_NETWORK) only the overridden tokens exist; they
 * keep the mainnet token's name and logo for the same symbol.
 */
function testTokens(): SwapToken[] {
  const wpls = { ...LISTED.find((t) => t.address === CORE[0])!, address: NETWORK.wpls }
  const others = Object.entries(NETWORK.tokens)
    .filter(([symbol]) => symbol !== TOKEN.ticker)
    .map(([symbol, raw]): SwapToken => {
      const mainnet = coreFirst(LISTED).find((t) => t.symbol === symbol)
      const address = getAddress(raw)
      return { ...(mainnet ?? { symbol, name: symbol, decimals: 18, tradable: true, color: colorFor(address) }), address }
    })
  return [wpls, ...others]
}

const onTestChain = Object.keys(NETWORK.tokens).length > 0

export const TOKENS: SwapToken[] = [PLS, LLAMA, ...(onTestChain ? testTokens() : coreFirst(LISTED))]

/**
 * Tokens a swap may route through, WPLS first and PLSX second (quote.ts
 * relies on that order). Most PulseChain pools pair with one of these.
 */
export const ROUTING_HUBS: Address[] = [
  NETWORK.wpls,
  ...['PLSX', 'HEX', 'DAI']
    .map((symbol) => TOKENS.find((t) => t.core && t.symbol === symbol)?.address)
    .filter((a): a is Address => !!a),
]

export const TOKEN_LIST_INFO = { version: tokenList.version, timestamp: tokenList.timestamp }

/** Same token: same contract (or both PLS). */
export const sameToken = (a: SwapToken, b: SwapToken) => a.address === b.address

export const findToken = (address: Address | null, extra: SwapToken[] = []) =>
  [...TOKENS, ...extra].find((t) => t.address === address)

// Tokens the visitor imported by address, kept in this browser only.
const IMPORTED_KEY = 'llamaswap.importedTokens'

export function makeImportedToken(address: Address, symbol: string, name: string, decimals: number): SwapToken {
  return {
    symbol: symbol.slice(0, 16),
    name: name.slice(0, 48),
    address,
    decimals,
    tradable: true,
    color: colorFor(address),
    imported: true,
  }
}

export function loadImportedTokens(): SwapToken[] {
  try {
    const raw = JSON.parse(localStorage.getItem(IMPORTED_KEY) ?? '[]') as Partial<SwapToken>[]
    return raw
      .filter((t) => typeof t.address === 'string' && typeof t.symbol === 'string')
      .map((t) => makeImportedToken(getAddress(t.address as string), String(t.symbol), String(t.name ?? t.symbol), Number(t.decimals ?? 18)))
      .filter((t) => !findToken(t.address))
  } catch {
    return []
  }
}

export function saveImportedToken(token: SwapToken) {
  try {
    const kept = loadImportedTokens().filter((t) => t.address !== token.address)
    const slim = [token, ...kept].slice(0, 50).map(({ address, symbol, name, decimals }) => ({ address, symbol, name, decimals }))
    localStorage.setItem(IMPORTED_KEY, JSON.stringify(slim))
  } catch {
    // Private mode or storage blocked: the token still works for this visit.
  }
}

/** Opens on PLS → $LLAMA once it's live, PLS → PLSX until then. */
export const DEFAULT_FROM = PLS
export const DEFAULT_TO = TOKEN.live ? LLAMA : TOKENS.find((t) => t.symbol === 'PLSX' && t.core)!
