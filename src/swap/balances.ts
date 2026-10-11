import type { Address, PublicClient } from 'viem'
import { erc20Abi } from './abi'
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
