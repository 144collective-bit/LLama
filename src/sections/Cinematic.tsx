import { useRef } from 'react'
import { motion, useMotionTemplate, useScroll, useSpring, useTransform } from 'framer-motion'
import { BackgroundVideo } from '../components/BackgroundVideo'
import { VIDEOS } from '../videos'

export function Cinematic() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 15, damping: 32, mass: 1.8 })
  const yScaleValue = useTransform(smooth, [0, 1], [60, -120])
  const opacity = useTransform(smooth, [0.3, 0.5], [0, 1])
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
            A neural-AI interface built on the architecture of the human nervous system. SynapseX
            translates synaptic activity into computational intelligence. Every signal becomes
            measurable, structured, and visible. It continuously reconstructs internal state as a
            dynamic neural map. Biological noise is filtered into actionable cognitive patterns.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
