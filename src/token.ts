/**
 * Everything the site says about the coin itself. Fill these in at launch;
 * anything left empty is hidden or shown as "coming soon" rather than faked.
 */
export const TOKEN = {
  name: 'LLama',
  ticker: '$LLAMA',
  /** The token contract on PulseChain, e.g. 0x1234…abcd. */
  contractAddress: '',
  social: {
    x: '',
    telegram: '',
  },
}

export const PULSECHAIN = {
  name: 'PulseChain',
  chainId: 369,
  symbol: 'PLS',
  rpcUrl: 'https://rpc.pulsechain.com',
  explorerUrl: 'https://scan.pulsechain.com',
  bridgeUrl: 'https://bridge.pulsechain.com',
  dexUrl: 'https://app.pulsex.com',
}

/** PulseX swap screen, preselecting $LLAMA once the contract is known. */
export function pulsexSwapUrl() {
  const base = `${PULSECHAIN.dexUrl}/swap`
  return TOKEN.contractAddress ? `${base}?outputCurrency=${TOKEN.contractAddress}` : base
}
