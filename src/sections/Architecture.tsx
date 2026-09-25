import { motion } from 'framer-motion'

const PHASES = [
  { n: 1, name: 'Launch' },
  { n: 2, name: 'Herd' },
  { n: 3, name: 'Summit' },
]

const inView = { once: true, amount: 0.4 }

export function Architecture() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-black px-6 py-32">
      <div className="mx-auto w-full max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: 1.0 }}
        >
          <p className="mb-8 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]">
            Roadmap
          </p>
          <h2 className="mb-10 text-[clamp(28px,6vw,56px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
            Three phases. Zero drama.
          </h2>
          <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-white/45 sm:text-[17px]">
            Phase one puts the llama on PulseX. Phase two grows the herd with memes, raids and
            more memes. Phase three is the summit, wherever the herd decides that is.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={inView}
          transition={{ duration: 1.2, delay: 0.4 }}
          className="mt-20 flex flex-col items-center gap-4"
        >
          {PHASES.map((phase) => (
            <div
              key={phase.n}
              className="flex h-[72px] w-full max-w-md items-center justify-between rounded-lg border border-white/10 px-6"
            >
              <span className="text-[12px] uppercase tracking-[0.15em] text-white/30">
                Phase {phase.n}
              </span>
              <span className="text-[16px] font-light text-white sm:text-[18px]">{phase.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
