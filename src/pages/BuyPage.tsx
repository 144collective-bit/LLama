import { useState } from 'react'
import { motion } from 'framer-motion'
import { PULSECHAIN, TOKEN, pulsexSwapUrl } from '../token'

interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider
  }
}

const inView = { once: true, amount: 0.2 }

const primaryButton =
  'inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13px] text-black transition-colors hover:bg-[#e2e2e6] disabled:cursor-not-allowed disabled:opacity-40'
const secondaryButton =
  'inline-flex h-10 items-center gap-2 rounded-full bg-white/15 px-5 text-[13px] text-white backdrop-blur-md transition-colors hover:bg-white/20'

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={secondaryButton}>
      {children}
      <i className="bi bi-arrow-up-right" aria-hidden="true" />
    </a>
  )
}

function AddNetworkButton() {
  const [status, setStatus] = useState<'idle' | 'added' | 'no-wallet' | 'failed'>('idle')

  const addNetwork = async () => {
    if (!window.ethereum) {
      setStatus('no-wallet')
      return
    }
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${PULSECHAIN.chainId.toString(16)}`,
            chainName: PULSECHAIN.name,
            nativeCurrency: { name: 'Pulse', symbol: PULSECHAIN.symbol, decimals: 18 },
            rpcUrls: [PULSECHAIN.rpcUrl],
            blockExplorerUrls: [PULSECHAIN.explorerUrl],
          },
        ],
      })
      setStatus('added')
    } catch {
      setStatus('failed')
    }
  }

  const message = {
    idle: '',
    added: 'PulseChain is in your wallet.',
    'no-wallet': 'No browser wallet found. Install one first, or add the network by hand below.',
    failed: 'The wallet declined. You can add the network by hand below.',
  }[status]

  return (
    <div className="flex flex-col items-start gap-3">
      <button type="button" onClick={addNetwork} className={secondaryButton}>
        <i className="bi bi-plus-lg" aria-hidden="true" />
        Add PulseChain to wallet
      </button>
      {message && <p className="text-[12px] text-white/40">{message}</p>}
    </div>
  )
}

function ContractCard() {
  const [copied, setCopied] = useState(false)
  const address = TOKEN.contractAddress

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be unavailable (insecure context, permissions); the address is still selectable.
    }
  }

  return (
    <div className="rounded-lg border border-white/10 p-6 text-left">
      <p className="text-[12px] uppercase tracking-[0.15em] text-white/30">
        {TOKEN.ticker} contract on {PULSECHAIN.name}
      </p>
      {address ? (
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <code className="select-all break-all text-[14px] text-white sm:text-[15px]">{address}</code>
          <button type="button" onClick={copy} className={`${primaryButton} shrink-0`}>
            <i className={`bi ${copied ? 'bi-check-lg' : 'bi-copy'}`} aria-hidden="true" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-[16px] font-light text-white sm:text-[18px]">
          Contract address drops at launch.
        </p>
      )}
      <p className="mt-4 text-[12px] leading-relaxed text-white/30">
        Only trust the address posted here and in the official channels. Copycat tokens with the
        same name are common.
      </p>
    </div>
  )
}

const STEPS = [
  {
    title: 'Get a wallet',
    desc: 'Install a browser wallet such as MetaMask or Rabby, then add PulseChain as a network. One click below does it, or use the settings further down.',
    action: <AddNetworkButton />,
  },
  {
    title: `Grab some ${PULSECHAIN.symbol}`,
    desc: `${PULSECHAIN.symbol} pays for gas on PulseChain. Bridge assets over from Ethereum with the official bridge and swap them for ${PULSECHAIN.symbol}, or buy ${PULSECHAIN.symbol} wherever you already trade.`,
    action: <ExternalLink href={PULSECHAIN.bridgeUrl}>PulseChain Bridge</ExternalLink>,
  },
  {
    title: 'Open PulseX',
    desc: "PulseX is PulseChain's main decentralised exchange. Open it and connect your wallet.",
    action: <ExternalLink href={pulsexSwapUrl()}>Open PulseX</ExternalLink>,
  },
  {
    title: `Swap for ${TOKEN.ticker}`,
    desc: `Paste the ${TOKEN.ticker} contract address as the token to receive, choose how much ${PULSECHAIN.symbol} to spend and confirm. Welcome to the herd.`,
    action: null,
  },
]

const NETWORK_ROWS = [
  { label: 'Network name', value: PULSECHAIN.name },
  { label: 'RPC URL', value: PULSECHAIN.rpcUrl },
  { label: 'Chain ID', value: String(PULSECHAIN.chainId) },
  { label: 'Currency symbol', value: PULSECHAIN.symbol },
  { label: 'Block explorer', value: PULSECHAIN.explorerUrl },
]

export function BuyPage() {
  return (
    <section className="relative min-h-screen w-full bg-black px-6 pb-32 pt-40">
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          className="text-center"
        >
          <p className="mb-8 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]">
            How to Buy
          </p>
          <h1 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
            Four steps to the herd.
          </h1>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-[17px]">
            {TOKEN.ticker} lives on {PULSECHAIN.name} and trades on PulseX. If you have never used
            PulseChain before, start at step one. It takes about ten minutes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-20"
        >
          <ContractCard />
        </motion.div>

        <ol className="mt-4 flex flex-col gap-4">
          {STEPS.map((step, i) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="flex flex-col gap-5 rounded-lg border border-white/10 p-6 sm:flex-row sm:gap-10"
            >
              <span className="shrink-0 text-[12px] uppercase tracking-[0.15em] text-white/30 sm:w-16 sm:pt-1.5">
                Step {i + 1}
              </span>
              <div className="flex flex-col gap-3">
                <h2 className="text-[16px] font-light text-white sm:text-[18px]">{step.title}</h2>
                <p className="text-[13px] leading-relaxed text-white/45 sm:text-[15px]">{step.desc}</p>
                {step.action && <div className="mt-2">{step.action}</div>}
              </div>
            </motion.li>
          ))}
        </ol>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 1.0 }}
          className="mt-24"
        >
          <p className="mb-8 text-center text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]">
            Network Settings
          </p>
          <dl className="rounded-lg border border-white/10">
            {NETWORK_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={`flex flex-col gap-1 px-6 py-4 sm:flex-row sm:items-center sm:justify-between ${
                  i > 0 ? 'border-t border-white/10' : ''
                }`}
              >
                <dt className="text-[12px] uppercase tracking-[0.15em] text-white/30">{row.label}</dt>
                <dd className="select-all break-all text-[14px] font-light text-white sm:text-[16px]">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>
    </section>
  )
}
