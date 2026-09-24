import { useEffect, useState } from 'react'
import { randomChar } from './scramble'

interface ScrambleInProps {
  text: string
  /** Milliseconds to wait after `triggered` before the reveal starts. */
  delay: number
  triggered: boolean
}

const FRAME_MS = 25
const CHARS_PER_FRAME = 0.5
const SCRAMBLE_AHEAD = 3

/** Entrance reveal: characters resolve left to right out of random glyphs. */
export function ScrambleIn({ text, delay, triggered }: ScrambleInProps) {
  const [display, setDisplay] = useState('')

  useEffect(() => {
    if (!triggered) return

    let interval: ReturnType<typeof setInterval> | undefined
    const timeout = setTimeout(() => {
      let cursor = 0
      interval = setInterval(() => {
        cursor += CHARS_PER_FRAME
        const revealed = Math.floor(cursor)

        if (revealed >= text.length) {
          clearInterval(interval)
          setDisplay(text)
          return
        }

        let next = ''
        for (let i = 0; i < text.length; i++) {
          const char = text[i]
          if (char === ' ') next += ' '
          else if (i < revealed) next += char
          else if (i < revealed + SCRAMBLE_AHEAD) next += randomChar()
        }
        setDisplay(next)
      }, FRAME_MS)
    }, delay)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [text, delay, triggered])

  // Keep the line's height while nothing has been revealed yet.
  if (!triggered || display === '') return <>&nbsp;</>
  return <>{display}</>
}
