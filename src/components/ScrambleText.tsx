import { useEffect, useState } from 'react'
import { randomChar } from './scramble'

interface ScrambleTextProps {
  text: string
  isHovered: boolean
  className?: string
}

const FRAME_MS = 25
const FRAMES_PER_CHAR = 4

/** Hover scramble: every character scrambles, then settles left to right. */
export function ScrambleText({ text, isHovered, className }: ScrambleTextProps) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    if (!isHovered) {
      setDisplay(text)
      return
    }

    let frame = 0
    const interval = setInterval(() => {
      frame += 1
      const revealed = Math.floor(frame / FRAMES_PER_CHAR)

      if (revealed >= text.length) {
        clearInterval(interval)
        setDisplay(text)
        return
      }

      setDisplay(
        text
          .split('')
          .map((char, i) => (char === ' ' ? ' ' : i < revealed ? char : randomChar()))
          .join(''),
      )
    }, FRAME_MS)

    return () => clearInterval(interval)
  }, [text, isHovered])

  return <span className={className}>{display}</span>
}
