import { Logo } from '../components/Logo'
import { TOKEN } from '../token'
import type { SwapToken } from './tokens'

/** Placeholder logos: the LLama mark for $LLAMA, a coloured initial for the rest. */
export function TokenLogo({ token, size = 28 }: { token: SwapToken; size?: number }) {
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
