import { motion } from 'framer-motion'
import { BackgroundVideo } from '../components/BackgroundVideo'
import { Logo } from '../components/Logo'
import { navigate } from '../router'
import { TOKEN, explorerTokenUrl, pulsexSwapUrl } from '../token'
import { VIDEOS } from '../videos'

const SOCIALS = [
  { label: 'X', icon: 'bi-twitter-x', href: TOKEN.social.x },
  { label: 'Telegram', icon: 'bi-telegram', href: TOKEN.social.telegram },
]

const EXTERNAL_LINKS = [
  { label: 'PulseX', href: pulsexSwapUrl() },
  { label: 'Explorer', href: explorerTokenUrl() },
].filter((link) => link.href)

const linkClass = 'text-white/50 transition-colors hover:text-white'

export function Footer() {
  return (
    <footer className="overflow-hidden bg-black">
      <div className="flex min-h-[400px] flex-col md:flex-row">
        <div className="relative h-[300px] w-full md:h-auto md:w-1/2">
          <BackgroundVideo src={VIDEOS.footer} />
        </div>

        <div className="flex w-full flex-col justify-between p-10 sm:p-16 md:w-1/2">
          <div>
            <div className="mb-8 flex items-center gap-2.5">
              <Logo size={18} className="text-white/70" />
              <span className="text-[15px] font-medium tracking-tight text-white/70">
                {TOKEN.name}
              </span>
            </div>
            <p className="max-w-sm text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              The llama of PulseChain. Built by the herd, for the herd. No promises, no drama, just
              a very calm animal and a lot of memes.
            </p>
            <div className="mt-8 flex items-center gap-2">
              {SOCIALS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${TOKEN.name} on ${social.label}`}
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.22)' }}
                  whileTap={{ scale: 0.95 }}
                  className="flex h-10 w-10 items-center justify-center rounded-[12px] text-[16px] text-white backdrop-blur-md"
                >
                  <i className={`bi ${social.icon}`} aria-hidden="true" />
                </motion.a>
              ))}
              <span className="ml-2 text-[13px] text-white/40">{TOKEN.social.handle}</span>
            </div>
            <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              <a
                href="/buy"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/buy')
                }}
                className={linkClass}
              >
                How to Buy
              </a>
              {EXTERNAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-12">
            <p className="max-w-sm text-[12px] leading-relaxed text-white/25">
              {TOKEN.ticker} is a meme coin with no intrinsic value or expectation of financial
              return. Nothing on this site is financial advice. Only spend what you can afford to
              lose.
            </p>
            <p className="mt-4 text-[12px] text-white/25">
              &copy; 2026 {TOKEN.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
