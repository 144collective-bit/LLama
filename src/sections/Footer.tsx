import { BackgroundVideo } from '../components/BackgroundVideo'
import { SynapseXLogo } from '../components/SynapseXLogo'
import { VIDEOS } from '../videos'

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
              <SynapseXLogo size={18} className="text-white/70" />
              <span className="text-[15px] font-medium tracking-tight text-white/70">SynapseX</span>
            </div>
            <p className="max-w-sm text-[14px] leading-relaxed text-white/40 sm:text-[15px]">
              The next evolution of human-machine interaction. Built for those who refuse to be
              limited by biology alone.
            </p>
          </div>
          <p className="mt-12 text-[12px] text-white/25">
            &copy; 2026 SynapseX Labs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
