import { lazy, Suspense, useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { ROUTES } from './router'
import { Footer } from './sections/Footer'

const ENTRANCE_DELAY_MS = 800

// Wallet code is heavy; only the swap page needs it.
const SwapPage = lazy(() => import('./pages/SwapPage'))

/** Holds the swap's space while its code loads, so nothing jumps. */
function SwapFallback() {
  return (
    <section className="min-h-screen w-full bg-black px-4 pb-32 pt-24 sm:px-6 sm:pt-40">
      <div className="mx-auto w-full max-w-md text-center">
        <p className="mb-4 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:mb-6 sm:text-[14px]">LLamaswap.pro</p>
        <h1 className="text-[clamp(28px,6vw,48px)] font-light leading-[1.15] tracking-[-0.02em] text-white">Zero <span className="inline-block">Platform fees</span></h1>
        <div className="mt-[66px] h-[420px] animate-pulse sm:mt-[91px] rounded-[24px] border border-white/10 bg-white/[0.03]" />
      </div>
    </section>
  )
}

const TITLE = 'LLamaswap.pro — Swap Preview'

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setEntranceComplete(true), ENTRANCE_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    document.title = TITLE
    // The exchange is the only page: old links (/token, /buy, /swap, …) land on it at /.
    if (window.location.pathname !== ROUTES.swap) {
      window.history.replaceState(null, '', ROUTES.swap + window.location.search + window.location.hash)
    }
  }, [])

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      <Navbar entranceComplete={entranceComplete} />
      <main>
        <Suspense fallback={<SwapFallback />}>
          <SwapPage />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
