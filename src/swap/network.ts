import { defineChain, getAddress, type Address } from 'viem'
import { PULSECHAIN } from '../token'

/**
 * SAFETY SWITCH. Swaps stay off until every address in this file and in
 * tokens.ts has been checked on the PulseChain explorer
 * (https://scan.pulsechain.com). Flip to true only after that check.
 */
const ADDRESSES_VERIFIED = false

export interface DexRouter {
  name: string
  router: Address
  factory: Address
}

interface NetworkConfig {
  chainId: number
  name: string
  rpcUrl: string
  explorerUrl: string
  /** Wrapped PLS: what the routers use in place of the native coin. */
  wpls: Address
  /** Quotes are taken from every router and the best one is used. */
  routers: DexRouter[]
  /** Token address overrides by symbol (for testnets). */
  tokens: Record<string, Address>
  swapsEnabled: boolean
}

const PULSECHAIN_MAINNET: NetworkConfig = {
  chainId: PULSECHAIN.chainId,
  name: PULSECHAIN.name,
  rpcUrl: PULSECHAIN.rpcUrl,
  explorerUrl: PULSECHAIN.explorerUrl,
  wpls: '0xA1077a294dDE1B09bB078844df40758a5D0f9a27',
  routers: [
    {
      name: 'PulseX V2',
      router: '0x165C3410fC91EF562C50559f7d2289fEbed552d9',
      factory: '0x29eA7545DEf87022BAdc76323F373EA1e707C523',
    },
    {
      name: 'PulseX V1',
      router: '0x98bf93ebf5c380C0e6Ae8e192A7e2AE08edAcc02',
      factory: '0x1715a3E4A142d8b698131108995174F37aEBA10D',
    },
  ],
  tokens: {},
  swapsEnabled: ADDRESSES_VERIFIED,
}

/**
 * VITE_SWAP_NETWORK replaces the mainnet config with JSON of the same shape,
 * for PulseChain testnet v4 or a local test chain. Unset in production.
 */
function load(): NetworkConfig {
  const raw = import.meta.env.VITE_SWAP_NETWORK as string | undefined
  if (!raw) return PULSECHAIN_MAINNET
  const override = JSON.parse(raw) as Partial<NetworkConfig>
  return { ...PULSECHAIN_MAINNET, tokens: {}, swapsEnabled: false, ...override }
}

const config = load()

export const NETWORK = {
  ...config,
  wpls: getAddress(config.wpls),
  routers: config.routers.map((r) => ({ ...r, router: getAddress(r.router), factory: getAddress(r.factory) })),
}

export const swapChain = defineChain({
  id: NETWORK.chainId,
  name: NETWORK.name,
  nativeCurrency: { name: 'Pulse', symbol: PULSECHAIN.symbol, decimals: 18 },
  rpcUrls: { default: { http: [NETWORK.rpcUrl] } },
  blockExplorers: { default: { name: 'PulseChain Explorer', url: NETWORK.explorerUrl } },
})

export function txUrl(hash: string) {
  return `${NETWORK.explorerUrl}/tx/${hash}`
}
