import { useRef } from 'react'
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from 'framer-motion'
import { BackgroundVideo } from '../components/BackgroundVideo'
import { TOKEN } from '../token'
import { VIDEOS } from '../videos'

export function Cinematic() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 })
  const yScaleValue = useTransform(smooth, [0, 1], [60, -120])
  // The fade tracks scroll directly rather than the slow spring above, so the text is
  // fully visible by the time it reaches the viewport instead of lagging behind it.
  const opacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1])
  const transform = useMotionTemplate`rotateX(24deg) translateY(${yScaleValue}px) translateZ(15px)`

  return (
    <section ref={ref} className="relative h-screen supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-black">
      <BackgroundVideo src={VIDEOS.cinematic} />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
        style={{ height: 180, background: 'linear-gradient(to bottom, #010103, transparent)' }}
      />

      <div className="relative z-20 flex h-full items-center justify-center">
        <div className="mx-auto w-full max-w-5xl" style={{ perspective: '400px' }}>
          <motion.p
            style={{ transform, opacity }}
            className="select-none px-6 text-center font-sans text-[22px] font-normal leading-[1.35] tracking-[-0.02em] text-white sm:px-12 sm:text-[30px] md:text-[36px] lg:text-[42px]"
          >
            Ignore the noise. Join the herd. All llama, no drama. {TOKEN.ticker} is built for the
            community and grows with it, one holder at a time on PulseChain. Next, the herd gets a
            home of its own: LLamaswap.pro launches in spring 2027.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
