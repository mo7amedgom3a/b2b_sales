export const SITE_URL = 'https://www.emasteryacademy.com'

/**
 * The public B2C API. Only the production www origin is allowed by the API's CORS,
 * so every other host (localhost, ngrok tunnels, LAN IPs) goes through the
 * Vite dev/preview proxy on `/api`.
 */
const isProductionSite =
  typeof window !== 'undefined' && window.location.origin === SITE_URL

const API_BASE = isProductionSite ? 'https://api.v3.emasteryacademy.com' : ''
const cache = new Map<string, Promise<unknown>>()

async function getJson<T>(path: string): Promise<T> {
  const url = `${API_BASE}${path}`
  const cached = cache.get(url)
  if (cached) return cached as Promise<T>

  const request = (async () => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 9000)
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error(`API ${response.status} ${path}`)
      return (await response.json()) as T
    } finally {
      window.clearTimeout(timeout)
    }
  })()

  cache.set(url, request)
  request.catch(() => cache.delete(url))
  return request
}

export type ApiExpert = {
  key: string
  name: string
  avatar: string | null
  specialized: string | null
  headline: string | null
  course_count: number
  diploma_count: number
  package_count: number
  consultation_count: number
  is_consultant: boolean
  categories: string[]
}

export type ApiPrice = {
  amount: number
  compare_at_amount: number | null
  currency_code: string
}

export type ApiProductCard = {
  product_id: string
  slug: string
  product_type: string
  title: string | null
  short_description: string | null
  image: string | null
  price: ApiPrice | null
  category: string | null
  instructor_name: string | null
  instructor_avatar: string | null
  instructor_key: string | null
  lesson_count: number
  duration_seconds: number | null
  updated_at: string | null
}

export type ApiProductCardPage = {
  items: ApiProductCard[]
  total: number
}

export function fetchExperts(): Promise<ApiExpert[]> {
  return getJson<ApiExpert[]>('/api/v1/catalog/experts?limit=500')
}

/** «المبيعات وخدمة العملاء» in `/api/v1/catalog/categories`. */
export const SALES_CATEGORY_ID = 'b64459a2-88f9-88e4-13db-53a41f6d132b'

/** Newest courses in the sales category only, filtered server-side. */
export function fetchSalesProductCards(limit = 12): Promise<ApiProductCardPage> {
  const params = new URLSearchParams({
    product_type: 'course',
    category_id: SALES_CATEGORY_ID,
    limit: String(limit),
    sort: 'newest',
  })
  return getJson<ApiProductCardPage>(`/api/v1/catalog/cards?${params}`)
}
