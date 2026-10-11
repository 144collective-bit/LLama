import { hexToString, type Address, type PublicClient } from 'viem'
import { erc20Abi, erc20Bytes32Abi } from './abi'
import type { SwapToken } from './tokens'

export function getTokenBalance(client: PublicClient, token: SwapToken, owner: Address) {
  return token.address
    ? client.readContract({ address: token.address, abi: erc20Abi, functionName: 'balanceOf', args: [owner] })
    : client.getBalance({ address: owner })
}

const decimalsCache = new Map<Address, number>()

/** Decimals as the contract reports them, so amounts can't be off by a power of ten. */
export async function getTokenDecimals(client: PublicClient, token: SwapToken) {
  if (!token.address) return 18
  const cached = decimalsCache.get(token.address)
  if (cached !== undefined) return cached
  const decimals = await client.readContract({ address: token.address, abi: erc20Abi, functionName: 'decimals' })
  decimalsCache.set(token.address, decimals)
  return decimals
}

/** Reads a string field (symbol or name), falling back to the old bytes32 form. */
async function readText(client: PublicClient, address: Address, field: 'symbol' | 'name') {
  try {
    return await client.readContract({ address, abi: erc20Abi, functionName: field })
  } catch {
    const raw = await client.readContract({ address, abi: erc20Bytes32Abi, functionName: field })
    return hexToString(raw, { size: 32 }).replace(/\0/g, '')
  }
}

/**
 * Symbol, name and decimals straight from the contract, for a token pasted by
 * address. Throws if the address isn't an ERC-20 token on this chain.
 */
export async function getTokenInfo(client: PublicClient, address: Address) {
  const [symbol, name, decimals] = await Promise.all([
    readText(client, address, 'symbol'),
    readText(client, address, 'name').catch(() => ''),
    client.readContract({ address, abi: erc20Abi, functionName: 'decimals' }),
  ])
  // Strip control and direction-changing characters a token could use to look like another.
  const clean = (s: string) => s.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g, '').trim()
  if (!clean(symbol)) throw new Error('This contract has no token symbol.')
  return { symbol: clean(symbol), name: clean(name) || clean(symbol), decimals }
}
