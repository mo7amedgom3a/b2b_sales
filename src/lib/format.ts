import type { ApiPrice } from './api'

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

/** Latin digits everywhere, independent of the Arabic text font. */
export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatPrice(price: ApiPrice | null): string {
  if (!price) return 'حسب الطلب'
  if (price.amount === 0) return 'مجاناً'
  return `${formatNumber(price.amount)} ${price.currency_code}`
}

export function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null
  const hours = seconds / 3600
  if (hours >= 1) return `${formatNumber(Math.round(hours))} ساعة`
  return `${formatNumber(Math.max(1, Math.round(seconds / 60)))} دقيقة`
}

export function formatCount(count: number, singular: string, plural: string): string {
  return `${formatNumber(count)} ${count === 1 ? singular : plural}`
}
