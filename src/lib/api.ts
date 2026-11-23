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

export type ApiSearchHit = {
  id: string
  slug: string
  title: string
  image: string | null
  duration_minutes: number | null
  instructors: string[]
  categories: string[]
  product_type: string | null
}

export type ApiSearchPage = {
  items: ApiSearchHit[]
  total: number
}

/** Full-text course search (relevance order). Instructors come back as names only. */
export function searchCourses(q: string, limit = 4): Promise<ApiSearchPage> {
  const params = new URLSearchParams({ q, product_type: 'course', limit: String(limit) })
  return getJson<ApiSearchPage>(`/api/v1/search?${params}`)
}

/** Catalog cards for specific slugs — adds course art, instructor avatar and lesson count. */
export function fetchCardsBySlugs(slugs: readonly string[]): Promise<ApiProductCardPage> {
  const params = new URLSearchParams({ limit: String(Math.max(1, slugs.length)) })
  slugs.forEach((slug) => params.append('slug', slug))
  return getJson<ApiProductCardPage>(`/api/v1/catalog/cards?${params}`)
}

/* ---------------------------------------------------------------- B2B library */

export type ApiB2BCategoryRef = { category_id: number; name: string; code: string }

export type ApiB2BTrainer = {
  trainer_id: number
  name: string
  avatar_url: string | null
  expert_key: string | null
}

export type ApiB2BProgram = {
  program_id: string
  kind: 'program' | 'course'
  title: string
  slug: string | null
  short_description: string | null
  image_url: string | null
  is_diploma: boolean
  lesson_count: number
  duration_seconds: number | null
  category: ApiB2BCategoryRef | null
  categories: ApiB2BCategoryRef[]
  trainers: ApiB2BTrainer[]
}

export type ApiB2BProgramPage = {
  items: ApiB2BProgram[]
  total: number
  limit: number
  offset: number
}

export type ApiB2BTrack = {
  key: string
  name: string
  description: string
  category_ids: number[]
  categories: ApiB2BCategoryRef[]
  program_count: number
}

export type B2BCoursesQuery = {
  /** Curated category group from `/b2b/tracks`, e.g. `sales-growth`. */
  track?: string
  /** Extra legacy category ids, combined with the track. */
  categoryIds?: readonly number[]
  /** `any`: in at least one category (default); `all`: in every one. */
  match?: 'any' | 'all'
  q?: string
  limit?: number
  offset?: number
}

/** B2B library programs, filterable by combined categories (track ∪ ids). */
export function fetchB2BCourses(query: B2BCoursesQuery = {}): Promise<ApiB2BProgramPage> {
  const params = new URLSearchParams({ limit: String(query.limit ?? 8) })
  if (query.offset) params.set('offset', String(query.offset))
  if (query.track) params.set('track', query.track)
  query.categoryIds?.forEach((id) => params.append('category_id', String(id)))
  if (query.match && query.match !== 'any') params.set('match', query.match)
  if (query.q?.trim()) params.set('q', query.q.trim())
  return getJson<ApiB2BProgramPage>(`/api/v1/b2b/courses?${params}`)
}

/** Curated groups of training fields with their live program counts. */
export function fetchB2BTracks(): Promise<{ items: ApiB2BTrack[] }> {
  return getJson<{ items: ApiB2BTrack[] }>('/api/v1/b2b/tracks')
}
