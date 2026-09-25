/** Everything the site says about the coin itself. */
export const TOKEN = {
  name: 'LLama',
  ticker: '$LLAMA',
  /** Placeholder until launch. Paste the real contract here and set `live` to true. */
  contractAddress: '0x11A3A00000000000000000000000000000000000',
  /**
   * While false, the address is labelled as a placeholder, can't be copied, and
   * isn't wired into PulseX or the explorer.
   */
  live: false,
  taxPercent: 0,
  liquidityBurnedPercent: 100,
  social: {
    handle: '@PulsechainLLama',
    x: 'https://x.com/PulsechainLLama',
    telegram: 'https://t.me/PulsechainLLama',
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

/** PulseX swap screen, preselecting $LLAMA once the contract is live. */
export function pulsexSwapUrl() {
  const base = `${PULSECHAIN.dexUrl}/swap`
  return TOKEN.live ? `${base}?outputCurrency=${TOKEN.contractAddress}` : base
}

/** The token's page on the PulseChain explorer, once the contract is live. */
export function explorerTokenUrl() {
  return TOKEN.live ? `${PULSECHAIN.explorerUrl}/token/${TOKEN.contractAddress}` : ''
}
