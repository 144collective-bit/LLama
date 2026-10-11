import { lazy, Suspense, useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { BuyPage } from './pages/BuyPage'
import { ROUTES, usePathname } from './router'
import { Architecture } from './sections/Architecture'
import { Cinematic } from './sections/Cinematic'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Metrics } from './sections/Metrics'
import { Technology } from './sections/Technology'
import { TOKEN } from './token'

const ENTRANCE_DELAY_MS = 800

// Wallet code is heavy; only the swap page needs it.
const SwapPage = lazy(() => import('./pages/SwapPage'))

/** Holds the swap's space while its code loads, so nothing jumps. */
function SwapFallback() {
  return (
    <section className="min-h-screen w-full bg-black px-4 pb-32 pt-24 sm:px-6 sm:pt-40">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="mb-4 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:mb-6 sm:text-[14px]">LLamaswap.pro</p>
        <h1 className="text-[clamp(28px,6vw,48px)] font-light leading-[1.15] tracking-[-0.02em] text-white"><span className="inline-block">No fees,</span> <span className="inline-block">no drama.</span></h1>
        <div className="mt-[66px] h-[420px] animate-pulse sm:mt-[91px] rounded-[24px] border border-white/10 bg-white/[0.03]" />
      </div>
    </section>
  )
}

type Page = 'swap' | 'token' | 'buy'

const TITLES: Record<Page, string> = {
  swap: 'LLamaswap.pro — Swap Preview',
  token: `${TOKEN.name} (${TOKEN.ticker}) — No Drama, Just Llama`,
  buy: `How to Buy ${TOKEN.ticker} — ${TOKEN.name}`,
}

/** `/swap` stays as an alias of the home page so earlier links keep working. */
function pageFor(pathname: string): Page {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === ROUTES.token) return 'token'
  if (path === ROUTES.buy) return 'buy'
  return 'swap'
}

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false)
  const pathname = usePathname()
  const page = pageFor(pathname)

  useEffect(() => {
    const timeout = setTimeout(() => setEntranceComplete(true), ENTRANCE_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    document.title = TITLES[page]
  }, [page])

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      <Navbar entranceComplete={entranceComplete} />
      <main>
        {page === 'buy' ? (
          <BuyPage />
        ) : page === 'swap' ? (
          <Suspense fallback={<SwapFallback />}>
            <SwapPage />
          </Suspense>
        ) : (
          <>
            <Hero entranceComplete={entranceComplete} />
            <Cinematic />
            <Metrics />
            <Technology />
            <Architecture />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}
