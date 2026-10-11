import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { sanitizeAmount } from './format'

export interface SwapSettings {
  /** Percent, e.g. 0.5 */
  slippage: number
  deadlineMinutes: number
}

interface SettingsPopoverProps {
  open: boolean
  settings: SwapSettings
  onChange: (settings: SwapSettings) => void
  onClose: () => void
}

const PRESETS = [0.1, 0.5, 1]

export function SettingsPopover({ open, settings, onChange, onClose }: SettingsPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    // Defer so the click that opened the popover doesn't immediately close it.
    const id = setTimeout(() => window.addEventListener('pointerdown', onPointer))
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(id)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const custom = !PRESETS.includes(settings.slippage)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-11 z-20 w-72 rounded-[16px] border border-white/10 bg-[#0b0b0d] p-4 shadow-2xl"
        >
          <p className="text-[12px] uppercase tracking-[0.15em] text-white/40">Slippage tolerance</p>
          <div className="mt-3 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange({ ...settings, slippage: p })}
                className={`h-9 flex-1 rounded-[10px] text-[13px] transition-colors ${
                  settings.slippage === p ? 'bg-white text-black' : 'bg-white/[0.06] text-white/70 hover:bg-white/10'
                }`}
              >
                {p}%
              </button>
            ))}
            <label
              className={`flex h-9 w-20 items-center rounded-[10px] px-2 text-[13px] ${
                custom ? 'border border-white/40' : 'bg-white/[0.06]'
              }`}
            >
              <input
                inputMode="decimal"
                aria-label="Custom slippage"
                placeholder="Custom"
                value={custom ? String(settings.slippage) : ''}
                onChange={(e) => {
                  const value = parseFloat(sanitizeAmount(e.target.value))
                  if (Number.isFinite(value)) onChange({ ...settings, slippage: Math.min(value, 50) })
                }}
                className="w-full bg-transparent text-white placeholder:text-white/30 focus:outline-none"
              />
              <span className="text-white/40">%</span>
            </label>
          </div>
          {settings.slippage >= 5 && (
            <p className="mt-2 text-[11px] text-amber-300/80">High slippage: your trade may be front-run.</p>
          )}

          <p className="mt-5 text-[12px] uppercase tracking-[0.15em] text-white/40">Transaction deadline</p>
          <label className="mt-3 flex h-9 w-28 items-center rounded-[10px] bg-white/[0.06] px-3 text-[13px]">
            <input
              inputMode="numeric"
              aria-label="Transaction deadline in minutes"
              value={settings.deadlineMinutes}
              onChange={(e) => {
                const value = parseInt(e.target.value.replace(/\D/g, ''), 10)
                onChange({ ...settings, deadlineMinutes: Number.isFinite(value) ? Math.min(value, 180) : 0 })
              }}
              className="w-full bg-transparent text-white focus:outline-none"
            />
            <span className="text-white/40">min</span>
          </label>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
