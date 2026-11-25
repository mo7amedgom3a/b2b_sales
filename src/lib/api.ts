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
  /** `program` for grouped programs (these carry trainers), `course` for standalone B2B courses. */
  kind?: 'program' | 'course'
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
  if (query.kind) params.set('kind', query.kind)
  return getJson<ApiB2BProgramPage>(`/api/v1/b2b/courses?${params}`)
}

/** Curated groups of training fields with their live program counts. */
export function fetchB2BTracks(): Promise<{ items: ApiB2BTrack[] }> {
  return getJson<{ items: ApiB2BTrack[] }>('/api/v1/b2b/tracks')
}

/** A trainer of the B2B library, with how many B2B programs they teach. */
export type B2BTrainer = {
  id: number
  name: string
  avatar: string | null
  programs: number
  /** Programs in the «المبيعات والنمو» track. */
  salesPrograms: number
  /** The field they teach most in. */
  topCategory: string | null
}

const SALES_TRACK = 'sales-growth'
const PAGE = 48
let trainersRequest: Promise<B2BTrainer[]> | null = null

/**
 * Every trainer of the B2B library, built from the programs that carry them
 * (`/b2b/courses?kind=program`, paged). Sales-track trainers come first, then by
 * program count. One shared request per page load.
 */
export function fetchB2BTrainers(): Promise<B2BTrainer[]> {
  if (trainersRequest) return trainersRequest
  trainersRequest = (async () => {
    const [first, tracks] = await Promise.all([
      fetchB2BCourses({ kind: 'program', limit: PAGE }),
      fetchB2BTracks().catch(() => ({ items: [] as ApiB2BTrack[] })),
    ])
    const offsets: number[] = []
    for (let offset = PAGE; offset < first.total; offset += PAGE) offsets.push(offset)
    const rest = await Promise.all(offsets.map((offset) => fetchB2BCourses({ kind: 'program', limit: PAGE, offset })))
    const programs = [first, ...rest].flatMap((page) => page.items)
    const salesIds = new Set(tracks.items.find((track) => track.key === SALES_TRACK)?.category_ids ?? [])

    const byId = new Map<number, B2BTrainer & { fields: Map<string, number> }>()
    for (const program of programs) {
      const inSales = program.categories.some((category) => salesIds.has(category.category_id))
      for (const trainer of program.trainers) {
        const entry =
          byId.get(trainer.trainer_id) ??
          { id: trainer.trainer_id, name: trainer.name.trim(), avatar: trainer.avatar_url, programs: 0, salesPrograms: 0, topCategory: null, fields: new Map() }
        entry.programs += 1
        if (inSales) entry.salesPrograms += 1
        if (!entry.avatar && trainer.avatar_url) entry.avatar = trainer.avatar_url
        const field = program.category?.name
        if (field) entry.fields.set(field, (entry.fields.get(field) ?? 0) + 1)
        byId.set(trainer.trainer_id, entry)
      }
    }
    return [...byId.values()]
      .map(({ fields, ...trainer }) => ({
        ...trainer,
        topCategory: [...fields.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      }))
      .sort((a, b) => b.salesPrograms - a.salesPrograms || b.programs - a.programs)
  })()
  trainersRequest.catch(() => {
    trainersRequest = null
  })
  return trainersRequest
}
