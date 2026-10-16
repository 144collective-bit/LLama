import { BackgroundVideo } from '../components/BackgroundVideo'
import { PULSECHAIN } from '../token'
import { VIDEOS } from '../videos'

const EXTERNAL_LINKS = [
  { label: 'PulseX', href: PULSECHAIN.dexUrl },
  { label: 'PulseChain Explorer', href: PULSECHAIN.explorerUrl },
  { label: 'Bridge', href: PULSECHAIN.bridgeUrl },
]

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
            <p className="max-w-sm text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              Swap any PulseChain token straight from your wallet, routed through PulseX liquidity.
              Zero platform fees.
            </p>
            <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
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
              Nothing on this site is financial advice. Swaps are final once confirmed in your
              wallet; always check token addresses and only trade what you can afford to lose.
            </p>
            <p className="mt-4 text-[12px] text-white/25">&copy; 2026. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
