import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SettingsPopover, type SwapSettings } from '../swap/SettingsPopover'
import { TokenLogo } from '../swap/TokenLogo'
import { TokenPicker } from '../swap/TokenPicker'
import { formatAmount, formatUsd, sanitizeAmount } from '../swap/format'
import { getQuote, type Quote } from '../swap/quote'
import { DEFAULT_FROM, DEFAULT_TO, type SwapToken } from '../swap/tokens'

type Side = 'from' | 'to'

/** Shrink long amounts so they fit beside the token button on a phone. */
function amountSize(text: string) {
  if (text.length > 12) return 'text-[20px] sm:text-[26px]'
  if (text.length > 9) return 'text-[24px] sm:text-[30px]'
  return 'text-[28px] sm:text-[32px]'
}

function TokenButton({ token, onClick }: { token: SwapToken; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-white/10 pl-1.5 pr-3 text-[14px] text-white transition-colors hover:bg-white/20"
    >
      <TokenLogo token={token} size={28} />
      {token.symbol}
      <i className="bi bi-chevron-down text-[11px] text-white/60" aria-hidden="true" />
    </button>
  )
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-[12px] sm:text-[13px]">
      <span className="text-white/40">{label}</span>
      <span className="text-right text-white/80">{children}</span>
    </div>
  )
}

export function SwapPage() {
  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(false)
  const [picker, setPicker] = useState<Side | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<SwapSettings>({ slippage: 0.5, deadlineMinutes: 20 })
  const [inverted, setInverted] = useState(false)
  const [notice, setNotice] = useState(false)
  const [flips, setFlips] = useState(0)

  const amountIn = parseFloat(amount)
  const hasAmount = Number.isFinite(amountIn) && amountIn > 0

  useEffect(() => {
    if (!hasAmount) {
      setQuote(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getQuote({ from, to, amountIn }).then((q) => {
      if (cancelled) return
      setQuote(q)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [from, to, amountIn, hasAmount])

  const flip = () => {
    setFrom(to)
    setTo(from)
    if (quote) setAmount(String(Number(quote.amountOut.toPrecision(6))))
    setFlips((n) => n + 1)
  }

  const selectToken = (token: SwapToken) => {
    if (picker === 'from') {
      if (token.symbol === to.symbol) setTo(from)
      setFrom(token)
    } else if (picker === 'to') {
      if (token.symbol === from.symbol) setFrom(to)
      setTo(token)
    }
    setPicker(null)
  }

  const closePicker = useCallback(() => setPicker(null), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const minReceived = quote ? quote.amountOut * (1 - settings.slippage / 100) : 0
  const impactClass =
    quote && quote.priceImpact >= 5 ? 'text-red-400' : quote && quote.priceImpact >= 1 ? 'text-amber-300' : ''

  return (
    <section className="relative min-h-screen w-full bg-black px-4 pb-32 pt-32 sm:px-6 sm:pt-40">
      <div className="mx-auto w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0 }}
          className="text-center"
        >
          <p className="mb-6 text-[13px] uppercase tracking-[0.2em] text-white/40 sm:text-[14px]">
            LLamaswap.pro
          </p>
          <h1 className="text-[clamp(28px,6vw,48px)] font-light leading-[1.15] tracking-[-0.02em] text-white">
            Swap. No drama.
          </h1>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
            Preview · not connected · launches spring 2027
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 rounded-[24px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-between px-3 pb-2 pt-2">
            <h2 className="text-[15px] text-white">Swap</h2>
            <button
              type="button"
              aria-label="Swap settings"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((o) => !o)}
              className="flex h-9 items-center gap-1.5 rounded-[10px] px-2 text-[12px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              {settings.slippage}% slippage
              <i className="bi bi-gear text-[15px]" aria-hidden="true" />
            </button>
            <SettingsPopover open={settingsOpen} settings={settings} onChange={setSettings} onClose={closeSettings} />
          </div>

          {/* You pay */}
          <div className="rounded-[18px] bg-white/[0.04] p-4 focus-within:ring-1 focus-within:ring-white/20">
            <p className="text-[12px] text-white/40">You pay</p>
            <div className="mt-2 flex items-center gap-3">
              <input
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                aria-label={`Amount of ${from.symbol} to pay`}
                value={amount}
                onChange={(e) => setAmount(sanitizeAmount(e.target.value))}
                className={`min-w-0 flex-1 bg-transparent font-light text-white placeholder:text-white/20 focus:outline-none ${amountSize(amount)}`}
              />
              <TokenButton token={from} onClick={() => setPicker('from')} />
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-white/40">
              <span>{quote ? formatUsd(quote.amountInUsd) : ' '}</span>
              <span>Balance: —</span>
            </div>
          </div>

          {/* Flip */}
          <div className="relative z-10 -my-3 flex justify-center">
            <motion.button
              type="button"
              aria-label="Flip tokens"
              onClick={flip}
              animate={{ rotate: flips * 180 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="flex h-10 w-10 items-center justify-center rounded-[12px] border-4 border-black bg-[#1a1a1d] text-white/80 transition-colors hover:text-white"
            >
              <i className="bi bi-arrow-down-up text-[14px]" aria-hidden="true" />
            </motion.button>
          </div>

          {/* You receive */}
          <div className="rounded-[18px] bg-white/[0.04] p-4">
            <p className="text-[12px] text-white/40">You receive</p>
            <div className="mt-2 flex items-center gap-3">
              <output
                aria-live="polite"
                className={`min-w-0 flex-1 truncate font-light ${amountSize(quote ? formatAmount(quote.amountOut) : '0')} ${
                  quote ? 'text-white' : 'text-white/20'
                } ${loading ? 'animate-pulse' : ''}`}
              >
                {quote ? formatAmount(quote.amountOut) : '0'}
              </output>
              <TokenButton token={to} onClick={() => setPicker('to')} />
            </div>
            <div className="mt-2 flex justify-between text-[12px] text-white/40">
              <span>{quote ? formatUsd(quote.amountOutUsd) : ' '}</span>
              <span>Balance: —</span>
            </div>
          </div>

          {/* Details */}
          <AnimatePresence initial={false}>
            {quote && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-1 pt-3">
                  <DetailRow label="Rate">
                    <button
                      type="button"
                      onClick={() => setInverted((v) => !v)}
                      className="inline-flex items-center gap-1.5 hover:text-white"
                      title="Invert rate"
                    >
                      {inverted
                        ? `1 ${to.symbol} = ${formatAmount(1 / quote.rate)} ${from.symbol}`
                        : `1 ${from.symbol} = ${formatAmount(quote.rate)} ${to.symbol}`}
                      <i className="bi bi-arrow-left-right text-[11px] text-white/40" aria-hidden="true" />
                    </button>
                  </DetailRow>
                  <DetailRow label="Price impact">
                    <span className={impactClass}>{quote.priceImpact < 0.01 ? '<0.01' : quote.priceImpact.toFixed(2)}%</span>
                  </DetailRow>
                  <DetailRow label={`Minimum received (${settings.slippage}%)`}>
                    {formatAmount(minReceived)} {to.symbol}
                  </DetailRow>
                  <DetailRow label="Route">{quote.route.join(' → ')}</DetailRow>
                  <DetailRow label="LP fee">{quote.lpFeePercent}%</DetailRow>
                  <DetailRow label="Network fee">—</DetailRow>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            disabled={!hasAmount}
            onClick={() => setNotice(true)}
            className="mt-2 h-14 w-full rounded-[18px] bg-white text-[15px] text-black transition-colors hover:bg-[#e2e2e6] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {hasAmount ? 'Connect wallet' : 'Enter an amount'}
          </button>

          <AnimatePresence>
            {notice && (
              <motion.p
                role="status"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden px-3 text-center text-[12px] leading-relaxed text-white/50"
              >
                <span className="block pb-2 pt-3">
                  This is a preview. Wallets and trading go live with LLamaswap.pro in spring 2027.
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-white/30">
          Prices, balances and routes on this page are placeholders, not market data.
        </p>
      </div>

      <TokenPicker
        open={picker !== null}
        selected={picker === 'to' ? to : from}
        onSelect={selectToken}
        onClose={closePicker}
      />
    </section>
  )
}
