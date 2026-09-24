import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { Architecture } from './sections/Architecture'
import { Cinematic } from './sections/Cinematic'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Metrics } from './sections/Metrics'
import { Technology } from './sections/Technology'

const ENTRANCE_DELAY_MS = 800

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setEntranceComplete(true), ENTRANCE_DELAY_MS)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div
      className="min-h-screen bg-black text-white"
      style={{ fontFamily: '"Space Mono", monospace' }}
    >
      <Navbar entranceComplete={entranceComplete} />
      <main>
        <Hero entranceComplete={entranceComplete} />
        <Cinematic />
        <Metrics />
        <Technology />
        <Architecture />
      </main>
      <Footer />
    </div>
  )
}
