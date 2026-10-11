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
 * Uniswap V2-style router. PulseX forks Uniswap V2; whether its functions say
 * "ETH" or "PLS" for the native coin is detected at runtime (see router.ts),
 * so both spellings are listed.
 */
export const routerAbi = parseAbi([
  'function factory() view returns (address)',
  'function WETH() view returns (address)',
  'function WPLS() view returns (address)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable',
  'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapExactPLSForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline) payable',
  'function swapExactTokensForPLSSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
])
