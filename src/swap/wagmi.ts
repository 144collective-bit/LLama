import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { defineChain, type AppKitNetwork } from '@reown/appkit/networks'
import { createAppKit, useAppKit } from '@reown/appkit/react'
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

/** WalletConnect directory IDs, as listed in AppKit's own presets. */
const FEATURED_WALLETS = [
  'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
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
  /** Opens the account view (AppKit) or disconnects (extensions only). */
  openAccount: () => void
  connecting: boolean
  notice: string
}

/** With AppKit: its wallet pop-up (extensions, QR codes, mobile apps). */
function useAppKitModal(): WalletModal {
  const { open } = useAppKit()
  return { open: () => void open(), openAccount: () => void open({ view: 'Account' }), connecting: false, notice: '' }
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
    openAccount: () => disconnect(),
    connecting: isPending,
    notice,
  }
}

/** Fixed per build, so hook order never changes between renders. */
export const useWalletModal = appKitEnabled ? useAppKitModal : useInjectedModal
