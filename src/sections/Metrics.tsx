import { motion } from 'framer-motion'
import { BackgroundVideo } from '../components/BackgroundVideo'
import { VIDEOS } from '../videos'

const METRICS = [
  { value: '2.4ms', label: 'Synaptic Latency' },
  { value: '99.7%', label: 'Signal Accuracy' },
  { value: '140B', label: 'Neural Parameters' },
]

export function Metrics() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <BackgroundVideo src={VIDEOS.metrics} />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 pb-32 pt-32">
        <div className="mx-auto w-full max-w-6xl">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2 }}
            className="mb-20 text-center text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]"
          >
            Performance Metrics
          </motion.p>

          <div className="grid grid-cols-1 gap-16 md:grid-cols-3 md:gap-8">
            {METRICS.map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-[clamp(48px,10vw,96px)] font-light leading-none tracking-[-0.04em] text-white">
                  {metric.value}
                </div>
                <div className="mt-4 text-[13px] tracking-wide text-white/40 sm:text-[15px]">
                  {metric.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
