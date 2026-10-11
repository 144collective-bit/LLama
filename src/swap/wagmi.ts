import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain, type AppKitNetwork } from '@reown/appkit/networks'
import { createAppKit, useAppKit, useDisconnect as useAppKitDisconnect } from '@reown/appkit/react'
import { useState } from 'react'
import { createConfig, http, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { NETWORK, swapChain } from './network'

/**
 * Reown (WalletConnect) project ID, from dashboard.reown.com. Public by design:
 * it ships in the page. Its allowed domains are managed in that dashboard.
 * Set VITE_REOWN_PROJECT_ID to "" to fall back to browser-extension wallets only.
 */
const PROJECT_ID = (import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined) ?? 'b630de806fe35c2ba6e6a52d321e0130'

export const appKitEnabled = PROJECT_ID.length > 0

/**
 * The wallets the connect menu lists, in this order (WalletConnect directory
 * IDs, from the directory at api.web3modal.org). Wallets already installed in
 * the visitor's browser (Rabby, …) are shown as well; the "All wallets" list
 * is hidden. Four is AppKit's cap, so it adds no "recommended" wallets.
 */
const FEATURED_WALLETS = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709', // OKX Wallet
  'dd43441a6368ec9046540c46c5fdc58f79926d17ce61a176444568ca7c970dcd', // Internet Money (phone app)
]

const network: AppKitNetwork = defineChain({
  ...swapChain,
  caipNetworkId: `eip155:${swapChain.id}`,
  chainNamespace: 'eip155',
})

const transports = { [swapChain.id]: http(NETWORK.rpcUrl) }

const adapter = appKitEnabled
  ? new WagmiAdapter({
      networks: [network],
      projectId: PROJECT_ID,
      transports,
      // Reads go to the PulseChain RPC, never Reown's.
      customRpcUrls: { [`eip155:${swapChain.id}`]: [{ url: NETWORK.rpcUrl }] },
    })
  : null

export const wagmiConfig =
  adapter?.wagmiConfig ??
  createConfig({ chains: [swapChain], connectors: [injected()], transports })

if (adapter) {
  const origin = typeof window === 'undefined' ? 'https://llamaswap.pro' : window.location.origin
  createAppKit({
    adapters: [adapter],
    networks: [network],
    defaultNetwork: network,
    projectId: PROJECT_ID,
    metadata: {
      name: 'LLamaswap',
      description: 'Swap on PulseChain. No drama.',
      url: origin,
      icons: [`${origin}/llamaswap-icon.png`],
    },
    featuredWalletIds: FEATURED_WALLETS,
    allWallets: 'HIDE',
    enableCoinbase: false,
    allowUnsupportedChain: false,
    // Wallets only: no hosted email/social wallets, and none of AppKit's own
    // swap, on-ramp or send screens competing with the site's swap.
    features: {
      email: false,
      socials: false,
      swaps: false,
      onramp: false,
      send: false,
      receive: false,
      history: false,
      analytics: false,
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-font-family': '"Space Mono", monospace',
      '--w3m-accent': '#ffffff',
      '--w3m-color-mix': '#000000',
      '--w3m-color-mix-strength': 20,
      '--w3m-border-radius-master': '3px',
      '--w3m-z-index': 70,
    },
  })
}

interface WalletModal {
  open: () => void
  disconnect: () => void
  connecting: boolean
  notice: string
}

/** With AppKit: its wallet pop-up (extensions, QR codes, mobile apps). */
function useAppKitModal(): WalletModal {
  const { open } = useAppKit()
  const { disconnect } = useAppKitDisconnect()
  return { open: () => void open(), disconnect: () => void disconnect(), connecting: false, notice: '' }
}

/** Without a project ID: the browser's injected wallet only. */
function useInjectedModal(): WalletModal {
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [notice, setNotice] = useState('')
  return {
    open: () => {
      setNotice('')
      if (!connectors[0] || !('ethereum' in window)) {
        setNotice('No browser wallet found. Install MetaMask or Rabby, or open this page in your wallet app.')
        return
      }
      connect({ connector: connectors[0] }, { onError: (err) => setNotice(err.message.split('\n')[0]) })
    },
    disconnect: () => disconnect(),
    connecting: isPending,
    notice,
  }
}

/** Fixed per build, so hook order never changes between renders. */
export const useWalletModal = appKitEnabled ? useAppKitModal : useInjectedModal
