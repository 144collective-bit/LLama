import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ScrambleIn } from '../components/ScrambleIn'
import { TOKEN } from '../token'
import { VIDEOS } from '../videos'

interface HeroProps {
  entranceComplete: boolean
}

/** Fraction of the video's duration scrubbed by one full viewport width of mouse travel. */
const SCRUB_SENSITIVITY = 0.8
const SEEK_EPSILON = 0.01

const headingClass =
  'text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]'

/**
 * Horizontal mouse movement moves the video's playhead by the same fraction of
 * its length (scaled by SCRUB_SENSITIVITY). Seeks are chained through the
 * `seeked` event: only one is in flight at a time, and when it lands the video
 * jumps straight to wherever the mouse has got to since, so fast movement
 * never queues up stale frames.
 */
function useMouseScrub(videoRef: React.RefObject<HTMLVideoElement>) {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let target = 0
    let seeking = false
    let lastX: number | null = null

    const maxTime = () => Math.max(0, video.duration - 0.05)

    const seek = () => {
      if (Math.abs(video.currentTime - target) < SEEK_EPSILON) {
        seeking = false
        return
      }
      seeking = true
      video.currentTime = target
    }

    const onSeeked = () => {
      seeking = false
      seek()
    }

    const onMouseMove = (e: MouseEvent) => {
      if (lastX === null) {
        lastX = e.clientX
        return
      }
      const dx = e.clientX - lastX
      lastX = e.clientX
      if (!Number.isFinite(video.duration) || video.duration === 0) return

      const delta = (dx / window.innerWidth) * video.duration * SCRUB_SENSITIVITY
      target = Math.min(maxTime(), Math.max(0, target + delta))
      if (!seeking) seek()
    }

    const onLoaded = () => {
      video.pause()
      video.currentTime = 0
    }

    video.addEventListener('seeked', onSeeked)
    video.addEventListener('loadedmetadata', onLoaded)
    window.addEventListener('mousemove', onMouseMove)
    return () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', onLoaded)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [videoRef])
}

export function Hero({ entranceComplete }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  useMouseScrub(videoRef)

  return (
    <section className="relative h-screen supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={VIDEOS.hero}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.05,
        }}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: entranceComplete ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="relative h-full w-full"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ transform: 'translateY(50px)', opacity: 0.1 }}
        >
          <span
            className="select-none whitespace-nowrap uppercase leading-none"
            style={{
              fontFamily: '"Anton SC", sans-serif',
              fontSize: 'clamp(120px, 30vw, 521px)',
              letterSpacing: '-4px',
              backgroundImage: 'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            PulseChain
          </span>
        </div>

        <div className="relative z-10 flex h-full flex-col px-4 pb-8 pt-20 sm:px-6 sm:pb-12 sm:pt-24 md:px-8">
          <div className="flex-1" />

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4">
              <h1 className={headingClass}>
                <ScrambleIn text="No Drama" delay={200} triggered={entranceComplete} />
                <br />
                <ScrambleIn text="Just Llama" delay={500} triggered={entranceComplete} />
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 25 }}
                animate={entranceComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 }}
                transition={{ duration: 0.9, ease: [0.215, 0.61, 0.355, 1], delay: 0.2 }}
                className="max-w-sm text-[13px] leading-relaxed text-white/60 sm:text-[15px]"
              >
                Born on PulseChain, raised by the community. {TOKEN.ticker} is a meme coin for
                everyone who has ever been told to calm down. Ten-second blocks, low fees, zero
                chill.
              </motion.p>
            </div>

            <h1 className={`${headingClass} text-left md:text-right`}>
              <ScrambleIn text="One" delay={700} triggered={entranceComplete} />
              <br />
              <ScrambleIn text="Herd" delay={1000} triggered={entranceComplete} />
            </h1>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
