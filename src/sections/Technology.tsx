import { motion } from 'framer-motion'
import { BackgroundVideo } from '../components/BackgroundVideo'
import { TOKEN } from '../token'
import { VIDEOS } from '../videos'

const SOCIALS = [
  {
    title: 'X',
    icon: 'bi-twitter-x',
    href: TOKEN.social.x,
    desc: 'Memes, raids and launch news as it happens.',
  },
  {
    title: 'Telegram',
    icon: 'bi-telegram',
    href: TOKEN.social.telegram,
    desc: 'Chat with the herd and get announcements first.',
  },
]

const inView = { once: true, amount: 0.3 }

export function Technology() {
  return (
    <section className="relative h-screen supports-[height:100dvh]:h-[100dvh] w-full overflow-hidden bg-black">
      <BackgroundVideo src={VIDEOS.technology} />

      <div className="relative z-10 flex h-full flex-col px-8 py-12 sm:px-12 sm:py-16 md:px-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <motion.h2
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 1.0 }}
            className="text-[clamp(36px,8vw,72px)] font-light leading-[0.95] tracking-[-0.03em] text-white"
          >
            Join
            <br />
            The Herd
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={inView}
            transition={{ duration: 1.0, delay: 0.2 }}
            className="max-w-xs text-[13px] leading-relaxed text-white/50 sm:text-[15px] md:pt-2 md:text-right"
          >
            The herd lives online. Follow {TOKEN.social.handle} for memes, raids and the first
            word on launch.
          </motion.p>
        </div>

        <div className="flex-1" />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={inView}
          transition={{ duration: 1.0, delay: 0.3 }}
          className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6"
        >
          {SOCIALS.map((social, i) => (
            <motion.a
              key={social.title}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={inView}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group block"
            >
              <i
                className={`bi ${social.icon} mb-4 block text-[22px] text-white/70 transition-colors group-hover:text-white`}
                aria-hidden="true"
              />
              <h3 className="mb-2 flex items-center gap-2 text-[14px] font-normal text-white sm:text-[16px]">
                {social.title}
                <i
                  className="bi bi-arrow-up-right text-[12px] text-white/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  aria-hidden="true"
                />
              </h3>
              <p className="text-[12px] leading-relaxed text-white/40 sm:text-[14px]">
                {social.desc}
              </p>
              <p className="mt-2 text-[12px] text-white/60 transition-colors group-hover:text-white sm:text-[14px]">
                {TOKEN.social.handle}
              </p>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
