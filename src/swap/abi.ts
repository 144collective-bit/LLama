import { parseAbi } from 'viem'

export const erc20Abi = parseAbi([
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function decimals() view returns (uint8)',
])

export const wplsAbi = parseAbi([
  'function deposit() payable',
  'function withdraw(uint256 amount)',
])

/**
 * Uniswap V2-style router. PulseX keeps Uniswap's "ETH" function names for the
 * native coin (as its own SDK, @pulsex/sdk, calls them) even though the
 * wrapped-coin getter is WPLS().
 */
export const routerAbi = parseAbi([
  'function factory() view returns (address)',
  'function WETH() view returns (address)',
  'function WPLS() view returns (address)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable',
  'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
])
