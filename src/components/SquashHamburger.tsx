import { motion } from 'framer-motion'

interface SquashHamburgerProps {
  isOpen: boolean
  mobile?: boolean
}

const spring = { type: 'spring', stiffness: 300, damping: 20 } as const

/** Three bars that squash into an X. */
export function SquashHamburger({ isOpen, mobile = false }: SquashHamburgerProps) {
  const width = mobile ? 15 : 18
  const height = mobile ? 10 : 12
  const bar = mobile ? 1.2 : 1.5
  const toCenter = (height - bar) / 2

  const barStyle = { height: bar, width: '100%', left: 0 }

  return (
    <span className="relative block" style={{ width, height }} aria-hidden="true">
      <motion.span
        className="absolute rounded-full bg-white"
        style={{ ...barStyle, top: 0 }}
        animate={isOpen ? { y: toCenter, rotate: 45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
      <motion.span
        className="absolute rounded-full bg-white"
        style={{ ...barStyle, top: toCenter }}
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={spring}
      />
      <motion.span
        className="absolute rounded-full bg-white"
        style={{ ...barStyle, top: height - bar }}
        animate={isOpen ? { y: -toCenter, rotate: -45 } : { y: 0, rotate: 0 }}
        transition={spring}
      />
    </span>
  )
}
