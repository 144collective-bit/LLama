/** Up to six significant digits, no scientific notation, trailing zeros dropped. */
export function formatAmount(value: number) {
  if (!Number.isFinite(value) || value === 0) return '0'
  if (value < 0.000001) return '<0.000001'
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 6 }).format(value)
}

/**
 * Keep digits and a single decimal point. Commas are thousands separators
 * ("1,000,000"), except a lone comma with no dot, which is a decimal ("0,5").
 */
export function sanitizeAmount(input: string) {
  const commas = (input.match(/,/g) ?? []).length
  const decimalComma = commas === 1 && !input.includes('.')
  const normalized = (decimalComma ? input.replace(',', '.') : input.replace(/,/g, '')).replace(/[^0-9.]/g, '')
  const [whole, ...rest] = normalized.split('.')
  return rest.length ? `${whole}.${rest.join('')}` : whole
}
