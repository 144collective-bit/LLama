import { motion } from 'framer-motion'
import { Logo } from './Logo'
import { ROUTES } from '../router'
import { TOKEN } from '../token'

interface NavbarProps {
  entranceComplete: boolean
}

const PILL_BG = 'rgba(255,255,255,0.15)'
const PILL_BG_HOVER = 'rgba(255,255,255,0.22)'

/** The exchange is the only page, so the logo just takes you back to the top. */
function goHome(e: React.MouseEvent) {
  e.preventDefault()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/** The swap page fills these with its wallet button (see swap/WalletButton.tsx). */
export const WALLET_SLOT_DESKTOP = 'nav-wallet-desktop'
export const WALLET_SLOT_MOBILE = 'nav-wallet-mobile'

export function Navbar({ entranceComplete }: NavbarProps) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-x-0 top-0 z-50 flex h-20 w-full items-center bg-transparent px-4 sm:px-6 md:px-8"
    >
      {/* Desktop */}
      <div className="hidden w-full items-center justify-between sm:flex">
        <motion.a
          href={ROUTES.swap}
          onClick={goHome}
          style={{ backgroundColor: PILL_BG }}
          whileHover={{ scale: 1.02, backgroundColor: PILL_BG_HOVER }}
          whileTap={{ scale: 0.98 }}
          className="flex h-12 items-center gap-2.5 rounded-[14px] px-5 backdrop-blur-md"
        >
          <Logo size={18} className="text-white" />
          <span className="text-[16px] font-medium tracking-tight text-white">{TOKEN.name}</span>
        </motion.a>
        <div className="flex items-center gap-2">
          <div id={WALLET_SLOT_DESKTOP} className="contents" />
        </div>
      </div>

      {/* Mobile */}
      <div className="flex w-full items-center justify-between gap-2 sm:hidden">
        <motion.a
          href={ROUTES.swap}
          onClick={goHome}
          style={{ backgroundColor: PILL_BG }}
          whileTap={{ scale: 0.98 }}
          className="flex h-9 shrink-0 items-center gap-2 rounded-[10px] px-3.5 backdrop-blur-md"
        >
          <Logo size={14} className="text-white" />
          <span className="text-[13px] font-medium tracking-tight text-white">{TOKEN.name}</span>
        </motion.a>
        <div id={WALLET_SLOT_MOBILE} className="contents" />
      </div>
    </motion.header>
  )
}
