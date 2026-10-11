import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { BuyPage } from './pages/BuyPage'
import { SwapPage } from './pages/SwapPage'
import { ROUTES, usePathname } from './router'
import { Architecture } from './sections/Architecture'
import { Cinematic } from './sections/Cinematic'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Metrics } from './sections/Metrics'
import { Technology } from './sections/Technology'
import { TOKEN } from './token'

const ENTRANCE_DELAY_MS = 800

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
          <SwapPage />
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
