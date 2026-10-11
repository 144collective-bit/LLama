import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TOKEN } from '../token'
import { TokenLogo } from './TokenLogo'
import { TOKENS, type SwapToken } from './tokens'

interface TokenPickerProps {
  open: boolean
  selected: SwapToken
  onSelect: (token: SwapToken) => void
  onClose: () => void
}

const POPULAR = ['PLS', TOKEN.ticker, 'PLSX', 'HEX']

function shortAddress(token: SwapToken) {
  if (token.address === null) return 'Native'
  if (!token.tradable) return 'Not live yet'
  return `${token.address.slice(0, 6)}…${token.address.slice(-4)}`
}

export function TokenPicker({ open, selected, onSelect, onClose }: TokenPickerProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setQuery('')
    const focus = setTimeout(() => inputRef.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focus)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace('$', '')
    if (!q) return TOKENS
    return TOKENS.filter(
      (t) =>
        t.symbol.toLowerCase().replace('$', '').includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.address ?? '').toLowerCase().includes(q),
    )
  }, [query])

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
              <h2 className="text-[16px] text-white">Select a token</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>

            <div className="px-5">
              <div className="flex h-11 items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.04] px-3 focus-within:border-white/30">
                <i className="bi bi-search text-[14px] text-white/40" aria-hidden="true" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name or paste address"
                  className="w-full bg-transparent text-[13px] text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TOKENS.filter((t) => POPULAR.includes(t.symbol)).map((t) => (
                  <button
                    key={t.symbol}
                    type="button"
                    onClick={() => onSelect(t)}
                    className={`flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[12px] transition-colors ${
                      t.symbol === selected.symbol
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
                <li key={t.symbol}>
                  <button
                    type="button"
                    onClick={() => onSelect(t)}
                    className={`flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06] ${
                      t.symbol === selected.symbol ? 'bg-white/[0.06]' : ''
                    }`}
                  >
                    <TokenLogo token={t} size={32} />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-[14px] text-white">{t.symbol}</span>
                      <span className="truncate text-[12px] text-white/40">{t.name}</span>
                    </span>
                    <span className="text-[11px] text-white/30">{shortAddress(t)}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-3 py-8 text-center text-[13px] text-white/40">No tokens found.</li>
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
