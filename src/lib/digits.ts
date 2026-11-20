const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'
const PERSIAN = '۰۱۲۳۴۵۶۷۸۹'
const LATIN = '0123456789'

/** Convert Arabic-Indic / Persian digits to Latin digits, then strip non-phone characters. */
export function toLatinDigits(input: string): string {
  let out = ''
  for (const char of input) {
    const ar = ARABIC_INDIC.indexOf(char)
    if (ar >= 0) {
      out += LATIN[ar]
      continue
    }
    const fa = PERSIAN.indexOf(char)
    if (fa >= 0) {
      out += LATIN[fa]
      continue
    }
    out += char
  }
  return out
}

export function normalizePhone(input: string): string {
  const latin = toLatinDigits(input).replace(/[^\d+]/g, '')
  return latin.startsWith('+') ? `+${latin.slice(1).replace(/\+/g, '')}` : latin.replace(/\+/g, '')
}

export function isValidPhone(input: string): boolean {
  return /^\+?[0-9]{8,15}$/.test(normalizePhone(input))
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim())
}

export function isValidFullName(input: string): boolean {
  return input.trim().split(/\s+/).filter(Boolean).length >= 2
}
