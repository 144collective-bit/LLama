import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAccount, useSwitchChain } from 'wagmi'
import { WALLET_SLOT_DESKTOP, WALLET_SLOT_MOBILE } from '../components/Navbar'
import { NETWORK, swapChain } from './network'
import { useWalletModal } from './wagmi'

const PILL_BG = 'rgba(255,255,255,0.15)'
const PILL_BG_HOVER = 'rgba(255,255,255,0.22)'

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`

function WalletButton({ mobile }: { mobile: boolean }) {
  const { address, chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const wallet = useWalletModal()
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const wrongChain = isConnected && chainId !== swapChain.id

  useEffect(() => {
    if (!menuOpen) return
    const onPointer = (e: PointerEvent) => ref.current && !ref.current.contains(e.target as Node) && setMenuOpen(false)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!isConnected) setMenuOpen(false)
  }, [isConnected])

  const size = mobile ? 'h-9 px-3.5 text-[13px] gap-1.5' : 'h-12 px-5 text-[15px] gap-2'

  if (!isConnected || !address) {
    return (
      <motion.button
        type="button"
        onClick={wallet.open}
        disabled={wallet.connecting}
        style={{ backgroundColor: PILL_BG }}
        whileHover={{ scale: 1.03, backgroundColor: PILL_BG_HOVER }}
        whileTap={{ scale: 0.97 }}
        className={`flex shrink-0 items-center rounded-full text-white backdrop-blur-md ${size}`}
      >
        <i className="bi bi-wallet2" aria-hidden="true" />
        {wallet.connecting ? 'Connecting…' : 'Connect'}
      </motion.button>
    )
  }

  const itemBase =
    'flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-white/[0.06]'
  const item = `${itemBase} text-white/80 hover:text-white`

  return (
    <div ref={ref} className="relative shrink-0">
      <motion.button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
        style={{ backgroundColor: PILL_BG }}
        whileHover={{ scale: 1.03, backgroundColor: PILL_BG_HOVER }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center rounded-full text-white backdrop-blur-md ${size}`}
      >
        <span className={`h-2 w-2 rounded-full ${wrongChain ? 'bg-amber-300' : 'bg-emerald-400'}`} />
        {short(address)}
        <i className={`bi bi-chevron-down text-[11px] text-white/60 transition-transform ${menuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
      </motion.button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[60] mt-2 w-60 rounded-[16px] border border-white/10 bg-[#0b0b0d] p-1.5 shadow-2xl"
          >
            <p className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-[0.15em] text-white/40">
              {wrongChain ? 'Wrong network' : `Connected · ${swapChain.name}`}
            </p>
            {wrongChain && (
              <button type="button" role="menuitem" className={item} onClick={() => switchChain({ chainId: swapChain.id })}>
                <i className="bi bi-arrow-repeat text-amber-300" aria-hidden="true" />
                Switch to {swapChain.name}
              </button>
            )}
            <button
              type="button"
              role="menuitem"
              className={item}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(address)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                } catch {
                  // Clipboard unavailable; the address is shown on the button anyway.
                }
              }}
            >
              <i className={`bi ${copied ? 'bi-check-lg text-emerald-400' : 'bi-copy'}`} aria-hidden="true" />
              {copied ? 'Copied' : 'Copy address'}
            </button>
            <a
              role="menuitem"
              className={item}
              href={`${NETWORK.explorerUrl}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
              View on explorer
            </a>
            <div className="my-1 border-t border-white/10" />
            <button
              type="button"
              role="menuitem"
              className={`${itemBase} text-red-300 hover:text-red-200`}
              onClick={() => {
                setMenuOpen(false)
                wallet.disconnect()
              }}
            >
              <i className="bi bi-box-arrow-right" aria-hidden="true" />
              Disconnect
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Puts the wallet button into the navbar's slots while the swap page is open. */
export function NavWalletButton() {
  const [slots, setSlots] = useState<{ desktop: HTMLElement | null; mobile: HTMLElement | null }>({
    desktop: null,
    mobile: null,
  })

  useEffect(() => {
    setSlots({
      desktop: document.getElementById(WALLET_SLOT_DESKTOP),
      mobile: document.getElementById(WALLET_SLOT_MOBILE),
    })
  }, [])

  return (
    <>
      {slots.desktop && createPortal(<WalletButton mobile={false} />, slots.desktop)}
      {slots.mobile && createPortal(<WalletButton mobile />, slots.mobile)}
    </>
  )
}
