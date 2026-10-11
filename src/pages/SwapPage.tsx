import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BaseError, formatUnits, parseUnits, UserRejectedRequestError, type Hash } from 'viem'
import { useAccount, useConnect, useDisconnect, usePublicClient, useSwitchChain, useWalletClient } from 'wagmi'
import { getTokenBalance, getTokenDecimals } from '../swap/balances'
import { executeSwap, type SwapStep } from '../swap/execute'
import { formatAmount, sanitizeAmount } from '../swap/format'
import { NETWORK, swapChain, txUrl } from '../swap/network'
import { getBestQuote, type Quote } from '../swap/quote'
import { checkRouters, type CheckedRouter } from '../swap/router'
import { SettingsPopover, type SwapSettings } from '../swap/SettingsPopover'
import { TokenLogo } from '../swap/TokenLogo'
import { TokenPicker } from '../swap/TokenPicker'
import { DEFAULT_FROM, DEFAULT_TO, TOKENS, type SwapToken } from '../swap/tokens'

type Side = 'from' | 'to'

/** Above this the swap button refuses; such trades are almost always mistakes. */
const MAX_PRICE_IMPACT = 15

type TxState =
  | { status: 'idle' }
  | { status: 'pending'; step: SwapStep; hash?: Hash }
  | { status: 'done'; hash: Hash }
  | { status: 'error'; message: string }

/** Shrink long amounts so they fit beside the token button on a phone. */
function amountSize(text: string) {
  if (text.length > 12) return 'text-[20px] sm:text-[26px]'
  if (text.length > 9) return 'text-[24px] sm:text-[30px]'
  return 'text-[28px] sm:text-[32px]'
}

function errorMessage(err: unknown) {
  if (err instanceof BaseError) {
    if (err.walk((e) => e instanceof UserRejectedRequestError)) return 'Cancelled in your wallet.'
    return err.shortMessage
  }
  return err instanceof Error ? err.message : 'Something went wrong.'
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`

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
  const { address: account, chainId, isConnected } = useAccount()
  const { connect, connectors, isPending: connecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: switching } = useSwitchChain()
  const publicClient = usePublicClient({ chainId: swapChain.id })
  const { data: walletClient } = useWalletClient({ chainId: swapChain.id })

  const [from, setFrom] = useState(DEFAULT_FROM)
  const [to, setTo] = useState(DEFAULT_TO)
  const [amount, setAmount] = useState('')
  const [picker, setPicker] = useState<Side | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settings, setSettings] = useState<SwapSettings>({ slippage: 0.5, deadlineMinutes: 20 })
  const [inverted, setInverted] = useState(false)
  const [flips, setFlips] = useState(0)
  const [walletNotice, setWalletNotice] = useState('')

  const [routers, setRouters] = useState<CheckedRouter[] | null>(null)
  const [routerProblems, setRouterProblems] = useState<string[]>([])
  const [decimals, setDecimals] = useState<{ from: number; to: number } | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoting, setQuoting] = useState(false)
  const [quoteError, setQuoteError] = useState('')
  const [balances, setBalances] = useState<{ from: bigint; to: bigint } | null>(null)
  const [refresh, setRefresh] = useState(0)
  const [tx, setTx] = useState<TxState>({ status: 'idle' })

  const wrongChain = isConnected && chainId !== swapChain.id
  const busy = tx.status === 'pending'

  // Verify the PulseX contracts once, before anything is quoted.
  useEffect(() => {
    if (!publicClient || !NETWORK.swapsEnabled) return
    let cancelled = false
    checkRouters(publicClient)
      .then(({ ok, problems }) => {
        if (cancelled) return
        setRouters(ok)
        setRouterProblems(problems)
      })
      .catch((err) => !cancelled && setRouterProblems([errorMessage(err)]))
    return () => {
      cancelled = true
    }
  }, [publicClient])

  useEffect(() => {
    if (!publicClient) return
    let cancelled = false
    setDecimals(null)
    Promise.all([getTokenDecimals(publicClient, from), getTokenDecimals(publicClient, to)])
      .then(([f, t]) => !cancelled && setDecimals({ from: f, to: t }))
      .catch(() => !cancelled && setDecimals({ from: from.decimals, to: to.decimals }))
    return () => {
      cancelled = true
    }
  }, [publicClient, from, to])

  const amountIn = useMemo(() => {
    if (!decimals || !amount || amount === '.') return null
    try {
      const value = parseUnits(amount, decimals.from)
      return value > 0n ? value : null
    } catch {
      return null
    }
  }, [amount, decimals])

  const tradable = from.tradable && to.tradable && from.symbol !== to.symbol

  // Live quote, debounced while typing.
  useEffect(() => {
    setQuoteError('')
    if (!publicClient || !routers || !amountIn || !tradable) {
      setQuote(null)
      setQuoting(false)
      return
    }
    let cancelled = false
    setQuoting(true)
    const timer = setTimeout(() => {
      getBestQuote(publicClient, routers, from, to, amountIn)
        .then((q) => {
          if (cancelled) return
          setQuote(q)
          if (!q) setQuoteError('No PulseX liquidity for this pair.')
        })
        .catch((err) => !cancelled && (setQuote(null), setQuoteError(errorMessage(err))))
        .finally(() => !cancelled && setQuoting(false))
    }, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [publicClient, routers, from, to, amountIn, tradable, refresh])

  useEffect(() => {
    if (!publicClient || !account) {
      setBalances(null)
      return
    }
    let cancelled = false
    Promise.all([getTokenBalance(publicClient, from, account), getTokenBalance(publicClient, to, account)])
      .then(([f, t]) => !cancelled && setBalances({ from: f, to: t }))
      .catch(() => !cancelled && setBalances(null))
    return () => {
      cancelled = true
    }
  }, [publicClient, account, from, to, refresh])

  const flip = () => {
    setFrom(to)
    setTo(from)
    if (quote && decimals) setAmount(formatUnits(quote.amountOut, decimals.to))
    setFlips((n) => n + 1)
    setTx({ status: 'idle' })
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
    setTx({ status: 'idle' })
  }

  const closePicker = useCallback(() => setPicker(null), [])
  const closeSettings = useCallback(() => setSettingsOpen(false), [])

  const onConnect = () => {
    setWalletNotice('')
    const injected = connectors[0]
    if (!injected || typeof window === 'undefined' || !('ethereum' in window)) {
      setWalletNotice('No browser wallet found. Install MetaMask or Rabby, or open this page in your wallet app.')
      return
    }
    connect({ connector: injected }, { onError: (err) => setWalletNotice(errorMessage(err)) })
  }

  const onSwap = async () => {
    if (!publicClient || !walletClient || !account || !quote) return
    setTx({ status: 'pending', step: quote.kind === 'swap' && from.address ? 'approve' : 'swap' })
    let swapSent = false
    try {
      const hash = await executeSwap({
        publicClient,
        walletClient,
        account,
        from,
        receivesNative: to.address === null,
        quote,
        slippageBps: BigInt(Math.round(settings.slippage * 100)),
        deadlineMinutes: settings.deadlineMinutes || 20,
        onStep: (step, h) => {
          if (step === 'swap' && h) swapSent = true
          setTx({ status: 'pending', step, hash: h })
        },
      })
      setTx({ status: 'done', hash })
      setAmount('')
      setRefresh((n) => n + 1)
    } catch (err) {
      const rejected = err instanceof BaseError && !!err.walk((e) => e instanceof UserRejectedRequestError)
      // Failing before the swap was sent means the pre-send simulation refused it,
      // almost always because the price moved past the slippage limit.
      const message =
        rejected || swapSent
          ? errorMessage(err)
          : `This swap would fail at the current price, so nothing was sent. The price may have moved more than your ${settings.slippage}% slippage; the quote has been refreshed.`
      setTx({ status: 'error', message })
      setRefresh((n) => n + 1)
    }
  }

  const fmt = (value: bigint, d: number) => formatAmount(Number(formatUnits(value, d)))
  const outText = quote && decimals ? fmt(quote.amountOut, decimals.to) : '0'
  const minReceived = quote ? (quote.amountOut * BigInt(10_000 - Math.round(settings.slippage * 100))) / 10_000n : 0n
  const impact = quote?.kind === 'swap' ? quote.priceImpact : null
  const impactClass = impact !== null && impact >= 5 ? 'text-red-400' : impact !== null && impact >= 1 ? 'text-amber-300' : ''
  const insufficient = !!(balances && amountIn && amountIn > balances.from)
  const routerBlocked = NETWORK.swapsEnabled && routers !== null && routers.length === 0

  // The one action the button offers right now, in order of what's blocking.
  let button: { label: string; onClick?: () => void; disabled?: boolean }
  if (!NETWORK.swapsEnabled) button = { label: 'Swaps not enabled yet', disabled: true }
  else if (!from.tradable || !to.tradable) button = { label: `${!from.tradable ? from.symbol : to.symbol} isn't live yet`, disabled: true }
  else if (!isConnected) button = { label: connecting ? 'Connecting…' : 'Connect wallet', onClick: onConnect, disabled: connecting }
  else if (wrongChain)
    button = {
      label: switching ? 'Switching…' : `Switch to ${swapChain.name}`,
      onClick: () => switchChain({ chainId: swapChain.id }, { onError: (err) => setWalletNotice(errorMessage(err)) }),
      disabled: switching,
    }
  else if (routerBlocked) button = { label: 'PulseX check failed', disabled: true }
  else if (!routers) button = { label: 'Checking PulseX…', disabled: true }
  else if (!amountIn) button = { label: 'Enter an amount', disabled: true }
  else if (insufficient) button = { label: `Insufficient ${from.symbol} balance`, disabled: true }
  else if (quoting) button = { label: 'Fetching price…', disabled: true }
  else if (!quote) button = { label: quoteError || 'No price available', disabled: true }
  else if (impact !== null && impact >= MAX_PRICE_IMPACT) button = { label: 'Price impact too high', disabled: true }
  else if (busy)
    button = {
      label: tx.step === 'approve' ? (tx.hash ? `Approving ${from.symbol}…` : 'Approve in your wallet…') : tx.hash ? 'Swapping…' : 'Confirm in your wallet…',
      disabled: true,
    }
  else button = { label: quote.kind === 'wrap' ? 'Wrap' : quote.kind === 'unwrap' ? 'Unwrap' : 'Swap', onClick: onSwap }

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
            <span className={`h-1.5 w-1.5 rounded-full ${NETWORK.swapsEnabled ? 'bg-emerald-400' : 'bg-amber-300'}`} />
            {NETWORK.swapsEnabled ? 'Routed through PulseX liquidity' : 'Swaps launching soon'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-10 rounded-[24px] border border-white/10 bg-white/[0.03] p-2 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-between gap-2 px-3 pb-2 pt-2">
            <h2 className="text-[15px] text-white">Swap</h2>
            <div className="flex items-center gap-1">
              {isConnected && account && (
                <button
                  type="button"
                  onClick={() => disconnect()}
                  title="Disconnect"
                  className="group flex h-9 items-center gap-1.5 rounded-[10px] px-2 text-[12px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${wrongChain ? 'bg-amber-300' : 'bg-emerald-400'}`} />
                  <span className="group-hover:hidden">{short(account)}</span>
                  <span className="hidden group-hover:inline">Disconnect</span>
                </button>
              )}
              <button
                type="button"
                aria-label="Swap settings"
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen((o) => !o)}
                className="flex h-9 items-center gap-1.5 rounded-[10px] px-2 text-[12px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                {settings.slippage}%
                <i className="bi bi-gear text-[15px]" aria-hidden="true" />
              </button>
            </div>
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
                disabled={busy}
                onChange={(e) => {
                  setAmount(sanitizeAmount(e.target.value))
                  if (tx.status !== 'pending') setTx({ status: 'idle' })
                }}
                className={`min-w-0 flex-1 bg-transparent font-light text-white placeholder:text-white/20 focus:outline-none ${amountSize(amount)}`}
              />
              <TokenButton token={from} onClick={() => !busy && setPicker('from')} />
            </div>
            <div className="mt-2 flex items-center justify-end gap-2 text-[12px] text-white/40">
              <span>Balance: {balances && decimals ? fmt(balances.from, decimals.from) : '—'}</span>
              {balances && decimals && from.address && balances.from > 0n && (
                <button
                  type="button"
                  onClick={() => setAmount(formatUnits(balances.from, decimals.from))}
                  className="rounded-[6px] px-1.5 py-0.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Max
                </button>
              )}
            </div>
          </div>

          {/* Flip */}
          <div className="relative z-10 -my-3 flex justify-center">
            <motion.button
              type="button"
              aria-label="Flip tokens"
              onClick={flip}
              disabled={busy}
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
                className={`min-w-0 flex-1 truncate font-light ${amountSize(outText)} ${
                  quote ? 'text-white' : 'text-white/20'
                } ${quoting ? 'animate-pulse' : ''}`}
              >
                {outText}
              </output>
              <TokenButton token={to} onClick={() => !busy && setPicker('to')} />
            </div>
            <div className="mt-2 flex justify-end text-[12px] text-white/40">
              <span>Balance: {balances && decimals ? fmt(balances.to, decimals.to) : '—'}</span>
            </div>
          </div>

          {/* Details */}
          <AnimatePresence initial={false}>
            {quote && decimals && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-1 pt-3">
                  {quote.kind === 'swap' ? (
                    <>
                      <DetailRow label="Rate">
                        <button
                          type="button"
                          onClick={() => setInverted((v) => !v)}
                          className="inline-flex items-center gap-1.5 hover:text-white"
                          title="Invert rate"
                        >
                          {(() => {
                            const rate =
                              Number(formatUnits(quote.amountOut, decimals.to)) / Number(formatUnits(quote.amountIn, decimals.from))
                            return inverted
                              ? `1 ${to.symbol} = ${formatAmount(1 / rate)} ${from.symbol}`
                              : `1 ${from.symbol} = ${formatAmount(rate)} ${to.symbol}`
                          })()}
                          <i className="bi bi-arrow-left-right text-[11px] text-white/40" aria-hidden="true" />
                        </button>
                      </DetailRow>
                      <DetailRow label="Price impact">
                        <span className={impactClass}>
                          {impact === null ? '—' : impact < 0.01 ? '<0.01%' : `${impact.toFixed(2)}%`}
                        </span>
                      </DetailRow>
                      <DetailRow label={`Minimum received (${settings.slippage}%)`}>
                        {fmt(minReceived, decimals.to)} {to.symbol}
                      </DetailRow>
                      <DetailRow label="Route">
                        {quote.router.name} ·{' '}
                        {quote.path
                          .map((a) => TOKENS.find((t) => t.address === a)?.symbol ?? short(a))
                          .map((s, i, all) => (i === 0 && !from.address ? 'PLS' : i === all.length - 1 && !to.address ? 'PLS' : s))
                          .join(' → ')}
                      </DetailRow>
                    </>
                  ) : (
                    <DetailRow label="Rate">1 PLS = 1 WPLS ({quote.kind === 'wrap' ? 'wrap' : 'unwrap'})</DetailRow>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {impact !== null && impact >= 5 && (
            <p className="px-3 pt-2 text-[12px] text-red-400">
              {impact >= MAX_PRICE_IMPACT
                ? `Price impact is over ${MAX_PRICE_IMPACT}%. Try a smaller amount.`
                : 'High price impact: you will get noticeably less than the market rate.'}
            </p>
          )}

          <button
            type="button"
            disabled={button.disabled}
            onClick={button.onClick}
            className="mt-2 h-14 w-full rounded-[18px] bg-white text-[15px] text-black transition-colors hover:bg-[#e2e2e6] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
          >
            {button.label}
          </button>

          <div role="status" className="px-3 text-center text-[12px] leading-relaxed">
            {walletNotice && <p className="pt-3 text-white/50">{walletNotice}</p>}
            {tx.status === 'pending' && tx.hash && (
              <p className="pt-3 text-white/50">
                Waiting for confirmation ·{' '}
                <a href={txUrl(tx.hash)} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  view transaction
                </a>
              </p>
            )}
            {tx.status === 'done' && (
              <p className="pt-3 text-emerald-400">
                Swap complete ·{' '}
                <a href={txUrl(tx.hash)} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
                  view on explorer
                </a>
              </p>
            )}
            {tx.status === 'error' && <p className="pt-3 text-red-400">{tx.message}</p>}
            {routerBlocked && (
              <p className="pt-3 text-red-400">
                The PulseX contracts didn&apos;t match the expected addresses, so swaps are blocked. {routerProblems.join(' ')}
              </p>
            )}
          </div>
        </motion.div>

        <p className="mt-6 text-center text-[12px] leading-relaxed text-white/30">
          Swaps run straight from your wallet through PulseX&apos;s contracts. Always check token addresses. Nothing
          here is financial advice.
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
