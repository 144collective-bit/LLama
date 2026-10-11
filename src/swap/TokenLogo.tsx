import { useState } from 'react'
import { Logo } from '../components/Logo'
import { TOKEN } from '../token'
import type { SwapToken } from './tokens'

/** The token's logo; the LLama mark for $LLAMA; a coloured initial if there's no logo or it fails to load. */
export function TokenLogo({ token, size = 28 }: { token: SwapToken; size?: number }) {
  const [failed, setFailed] = useState<string | null>(null)

  if (token.symbol === TOKEN.ticker) {
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full bg-white text-black"
        style={{ width: size, height: size }}
      >
        <Logo size={size * 0.6} />
      </span>
    )
  }

  if (token.logo && failed !== token.logo) {
    return (
      <img
        src={token.logo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(token.logo ?? null)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-black"
      style={{ width: size, height: size, backgroundColor: token.color, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {token.symbol.replace('$', '').charAt(0)}
    </span>
  )
}
