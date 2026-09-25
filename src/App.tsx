import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { BuyPage } from './pages/BuyPage'
import { usePathname } from './router'
import { Architecture } from './sections/Architecture'
import { Cinematic } from './sections/Cinematic'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Metrics } from './sections/Metrics'
import { Technology } from './sections/Technology'
import { TOKEN } from './token'

const ENTRANCE_DELAY_MS = 800

const TITLES: Record<string, string> = {
  '/': `${TOKEN.name} (${TOKEN.ticker}) — No Drama, Just Llama`,
  '/buy': `How to Buy ${TOKEN.ticker} — ${TOKEN.name}`,
}

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false)
  const pathname = usePathname()
  const page = pathname === '/buy' ? '/buy' : '/'

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
        {page === '/buy' ? (
          <BuyPage />
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
