import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { getAddress, isAddress } from 'viem'
import { usePublicClient } from 'wagmi'
import { getTokenInfo } from './balances'
import { swapChain } from './network'
import { TokenLogo } from './TokenLogo'
import {
  LLAMA,
  loadImportedTokens,
  makeImportedToken,
  sameToken,
  saveImportedToken,
  TOKENS,
  type SwapToken,
} from './tokens'

interface TokenPickerProps {
  open: boolean
  selected: SwapToken
  onSelect: (token: SwapToken) => void
  onClose: () => void
}

const POPULAR = [TOKENS[0], LLAMA, ...['PLSX', 'HEX'].map((s) => TOKENS.find((t) => t.core && t.symbol === s)!)]

const keyOf = (token: SwapToken) => token.address ?? 'PLS'

function shortAddress(token: SwapToken) {
  if (token.address === null) return 'Native'
  if (!token.tradable) return 'Not live yet'
  return `${token.address.slice(0, 6)}…${token.address.slice(-4)}`
}

/** Lower is better: exact symbol, symbol prefix, name prefix, anywhere; core tokens before look-alikes. */
function rank(token: SwapToken, q: string) {
  const symbol = token.symbol.toLowerCase().replace('$', '')
  const name = token.name.toLowerCase()
  const base = symbol === q ? 0 : symbol.startsWith(q) ? 1 : name.startsWith(q) ? 2 : symbol.includes(q) || name.includes(q) ? 3 : -1
  if (base < 0) return -1
  return base * 2 + (token.core ? 0 : 1)
}

type Lookup =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; token: SwapToken }
  | { status: 'error'; message: string }

export function TokenPicker({ open, selected, onSelect, onClose }: TokenPickerProps) {
  const [query, setQuery] = useState('')
  const [imported, setImported] = useState<SwapToken[]>([])
  const [lookup, setLookup] = useState<Lookup>({ status: 'idle' })
  const [confirming, setConfirming] = useState<SwapToken | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const publicClient = usePublicClient({ chainId: swapChain.id })

  useEffect(() => {
    if (!open) return
    setQuery('')
    setConfirming(null)
    setImported(loadImportedTokens())
    const focus = setTimeout(() => inputRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focus)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const all = useMemo(() => [...TOKENS, ...imported], [imported])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace('$', '')
    if (!q) return all
    if (isAddress(q, { strict: false })) return all.filter((t) => t.address?.toLowerCase() === q)
    return all
      .map((t) => ({ t, r: rank(t, q) }))
      .filter(({ r }) => r >= 0)
      .sort((a, b) => a.r - b.r)
      .map(({ t }) => t)
  }, [query, all])

  // A pasted address that isn't listed: read the token from the chain.
  const pasted = query.trim()
  const unknownAddress = isAddress(pasted, { strict: false }) && results.length === 0 ? getAddress(pasted) : null
  useEffect(() => {
    if (!unknownAddress || !publicClient) return setLookup({ status: 'idle' })
    let cancelled = false
    setLookup({ status: 'loading' })
    getTokenInfo(publicClient, unknownAddress)
      .then((info) => {
        if (!cancelled) setLookup({ status: 'found', token: makeImportedToken(unknownAddress, info.symbol, info.name, info.decimals) })
      })
      .catch(() => {
        if (!cancelled) setLookup({ status: 'error', message: 'No token found at this address on PulseChain.' })
      })
    return () => {
      cancelled = true
    }
  }, [unknownAddress, publicClient])

  const confirmImport = (token: SwapToken) => {
    saveImportedToken(token)
    setImported(loadImportedTokens())
    onSelect(token)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Select a token"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[80dvh] w-full max-w-md flex-col rounded-t-[20px] border border-white/10 bg-[#0b0b0d] sm:rounded-[20px]"
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-5">
              <h2 className="text-[16px] text-white">{confirming ? 'Import token' : 'Select a token'}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>

            {confirming ? (
              <div className="flex flex-col gap-4 px-5 pb-5">
                <div className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-3">
                  <TokenLogo token={confirming} size={36} />
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[14px] text-white">{confirming.symbol}</span>
                    <span className="truncate text-[12px] text-white/50">{confirming.name}</span>
                    <span className="break-all text-[11px] text-white/40">{confirming.address}</span>
                  </span>
                </div>
                <p className="rounded-[14px] border border-amber-300/30 bg-amber-300/[0.06] p-3 text-[12px] leading-relaxed text-amber-200">
                  <i className="bi bi-exclamation-triangle mr-1.5" aria-hidden="true" />
                  This token isn't on the token list. Anyone can create a token with any name and logo, including
                  fake copies of real ones. Only trade it if you got this exact address from a source you trust.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="h-11 flex-1 rounded-[14px] border border-white/15 text-[13px] text-white/80 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => confirmImport(confirming)}
                    className="h-11 flex-1 rounded-[14px] bg-white text-[13px] text-black transition-colors hover:bg-[#e2e2e6]"
                  >
                    I understand, import
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="px-5">
                  <div className="flex h-11 items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 focus-within:border-white/30">
                    <i className="bi bi-search text-[14px] text-white/40" aria-hidden="true" />
                    <input
                      ref={inputRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search name or paste address"
                      aria-label="Search tokens by name, symbol or address"
                      className="w-full bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {POPULAR.map((t) => (
                      <button
                        key={keyOf(t)}
                        type="button"
                        onClick={() => onSelect(t)}
                        className={`flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition-colors ${
                          sameToken(t, selected)
                            ? 'border-white/40 text-white'
                            : 'border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <TokenLogo token={t} size={18} />
                        {t.symbol}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10" />
                <ul className="flex-1 overflow-y-auto px-2 py-2">
                  {results.map((t) => (
                    <li key={keyOf(t)}>
                      <button
                        type="button"
                        onClick={() => onSelect(t)}
                        className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] ${
                          sameToken(t, selected) ? 'bg-white/[0.06]' : ''
                        }`}
                      >
                        <TokenLogo token={t} size={32} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="flex items-center gap-1.5 text-[14px] text-white">
                            {t.symbol}
                            {t.imported && (
                              <span className="rounded-full border border-amber-300/40 px-1.5 text-[10px] text-amber-200">
                                Imported
                              </span>
                            )}
                          </span>
                          <span className="truncate text-[12px] text-white/40">{t.name}</span>
                        </span>
                        <span className="shrink-0 text-[11px] text-white/30">{shortAddress(t)}</span>
                      </button>
                    </li>
                  ))}
                  {unknownAddress && lookup.status === 'loading' && (
                    <li className="px-3 py-8 text-center text-[13px] text-white/40">Looking up this address…</li>
                  )}
                  {unknownAddress && lookup.status === 'found' && (
                    <li>
                      <div className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5">
                        <TokenLogo token={lookup.token} size={32} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="text-[14px] text-white">{lookup.token.symbol}</span>
                          <span className="truncate text-[12px] text-amber-200/80">Not on the token list</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirming(lookup.token)}
                          className="h-8 shrink-0 rounded-full bg-white px-3 text-[12px] text-black transition-colors hover:bg-[#e2e2e6]"
                        >
                          Import
                        </button>
                      </div>
                    </li>
                  )}
                  {unknownAddress && lookup.status === 'error' && (
                    <li className="px-3 py-8 text-center text-[13px] text-white/40">{lookup.message}</li>
                  )}
                  {!unknownAddress && results.length === 0 && (
                    <li className="px-3 py-8 text-center text-[13px] text-white/40">
                      No tokens found. Paste the token's contract address to import it.
                    </li>
                  )}
                </ul>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
