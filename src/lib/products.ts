import type { ApiProductCard } from './api'

/** Keep displayable courses (cover + title) in the API's newest-first order. */
export function pickSalesProducts(items: ApiProductCard[], count = 6): ApiProductCard[] {
  return items
    .filter((item) => item.product_type === 'course' && item.image && item.title?.trim())
    .slice(0, count)
}
