import { createConfig, http } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { NETWORK, swapChain } from './network'

/** Browser wallets only (MetaMask, Rabby, …); reads go through the PulseChain RPC. */
export const wagmiConfig = createConfig({
  chains: [swapChain],
  connectors: [injected()],
  transports: { [swapChain.id]: http(NETWORK.rpcUrl) },
})
