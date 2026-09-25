import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ScrambleText } from './ScrambleText'
import { SquashHamburger } from './SquashHamburger'
import { Logo } from './Logo'
import { navigate, navigateHomeAndScroll } from '../router'
import { TOKEN } from '../token'

interface NavbarProps {
  entranceComplete: boolean
}

const spring = { type: 'spring', stiffness: 350, damping: 28 } as const

const PILL_BG = 'rgba(255,255,255,0.15)'
const PILL_BG_HOVER = 'rgba(255,255,255,0.22)'

const LINKS = [
  { label: 'Lore', top: () => window.innerHeight },
  { label: 'Tokenomics', top: () => window.innerHeight * 2 },
]

function goHome(e: React.MouseEvent) {
  e.preventDefault()
  navigateHomeAndScroll(() => 0)
}

function NavLink({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`whitespace-nowrap font-normal text-white/85 transition-colors hover:text-white ${className}`}
    >
      <ScrambleText text={label} isHovered={hovered} />
    </button>
  )
}

function BuyButton({ mobile }: { mobile: boolean }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.a
      href="/buy"
      onClick={(e) => {
        e.preventDefault()
        navigate('/buy')
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ backgroundColor: '#ffffff' }}
      whileHover={{ scale: 1.03, backgroundColor: '#e2e2e6' }}
      whileTap={{ scale: 0.97 }}
      className={`flex shrink-0 items-center rounded-full font-medium text-black ${
        mobile ? 'h-9 gap-1.5 px-3.5 text-[13px]' : 'h-12 gap-2 px-6 text-[16px]'
      }`}
    >
      <i className="bi bi-lightning-charge-fill" aria-hidden="true" />
      <ScrambleText text={`Buy ${TOKEN.ticker}`} isHovered={hovered} />
    </motion.a>
  )
}

export function Navbar({ entranceComplete }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (top: () => number) => {
    navigateHomeAndScroll(top)
    setMenuOpen(false)
  }

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: entranceComplete ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-x-0 top-0 z-50 flex h-20 w-full items-center bg-transparent px-4 sm:px-6 md:px-8"
    >
      {/* Desktop */}
      <div className="hidden w-full items-center justify-between sm:flex">
        <div className="flex items-center gap-2">
          <motion.a
            href="/"
            onClick={goHome}
            style={{ backgroundColor: PILL_BG }}
            whileHover={{ scale: 1.02, backgroundColor: PILL_BG_HOVER }}
            whileTap={{ scale: 0.98 }}
            className={`${menuOpen ? 'hidden md:flex' : 'flex'} h-12 items-center gap-2.5 rounded-[14px] px-5 backdrop-blur-md`}
          >
            <Logo size={18} className="text-white" />
            <span className="text-[16px] font-medium tracking-tight text-white">{TOKEN.name}</span>
          </motion.a>

          <motion.nav
            initial={false}
            animate={{ width: menuOpen ? 290 : 48 }}
            transition={spring}
            style={{ backgroundColor: PILL_BG }}
            className="flex h-12 items-center overflow-hidden rounded-[14px] backdrop-blur-md"
          >
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex shrink-0 items-center justify-center transition-colors ${
                menuOpen
                  ? 'ml-1.5 h-9 w-9 rounded-[11px] bg-white/10 hover:bg-white/20'
                  : 'h-12 w-12 rounded-[14px]'
              }`}
            >
              <SquashHamburger isOpen={menuOpen} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="ml-6 flex items-center gap-7"
                >
                  {LINKS.map((link) => (
                    <NavLink
                      key={link.label}
                      label={link.label}
                      onClick={() => go(link.top)}
                      className="text-[16px]"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </div>

        <BuyButton mobile={false} />
      </div>

      {/* Mobile */}
      <div className="flex w-full items-center justify-between gap-2 sm:hidden">
        <div className="flex min-w-0 flex-1 items-center">
          <motion.a
            href="/"
            onClick={goHome}
            initial={false}
            animate={{
              width: menuOpen ? 0 : 'auto',
              marginRight: menuOpen ? 0 : 8,
              opacity: menuOpen ? 0 : 1,
            }}
            transition={spring}
            style={{ backgroundColor: PILL_BG }}
            className="flex h-9 shrink-0 items-center overflow-hidden rounded-[10px] backdrop-blur-md"
          >
            <span className="flex items-center gap-2 whitespace-nowrap px-3.5">
              <Logo size={14} className="text-white" />
              <span className="text-[13px] font-medium tracking-tight text-white">{TOKEN.name}</span>
            </span>
          </motion.a>

          <motion.nav
            initial={false}
            animate={{ width: menuOpen ? '100%' : 36 }}
            transition={spring}
            style={{ backgroundColor: PILL_BG }}
            className="flex h-9 items-center overflow-hidden rounded-[10px] backdrop-blur-md"
          >
            <button
              type="button"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={`flex shrink-0 items-center justify-center transition-colors ${
                menuOpen
                  ? 'ml-1 h-7 w-7 rounded-[8px] bg-white/10 hover:bg-white/20'
                  : 'h-9 w-9 rounded-[10px]'
              }`}
            >
              <SquashHamburger isOpen={menuOpen} mobile />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.25 }}
                  className="ml-4 flex items-center gap-5"
                >
                  {LINKS.map((link) => (
                    <NavLink
                      key={link.label}
                      label={link.label}
                      onClick={() => go(link.top)}
                      className="text-[13px]"
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        </div>

        <BuyButton mobile />
      </div>
    </motion.header>
  )
}
