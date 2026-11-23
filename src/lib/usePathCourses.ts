import { useEffect, useState } from 'react'
import { fallbackProducts } from '../content/products'
import { fetchB2BCourses, fetchB2BTracks, fetchCardsBySlugs, fetchSalesProductCards, searchCourses } from './api'
import type { ApiB2BProgram, ApiB2BTrack, ApiProductCard, ApiSearchHit } from './api'
import { formatDuration } from './format'

export type PathCourse = {
  slug: string
  title: string
  image: string | null
  instructor: string | null
  avatar: string | null
  lessons: number | null
  duration: string | null
}

export type PathCoursesStatus = 'loading' | 'live' | 'fallback'

const COUNT = 4

function fromCard(card: ApiProductCard): PathCourse | null {
  const title = card.title?.trim()
  if (!title) return null
  return {
    slug: card.slug,
    title,
    image: card.image,
    instructor: card.instructor_name?.trim() || null,
    avatar: card.instructor_avatar,
    lessons: card.lesson_count || null,
    duration: formatDuration(card.duration_seconds),
  }
}

function fromHit(hit: ApiSearchHit, card: ApiProductCard | undefined): PathCourse {
  const enriched = card ? fromCard(card) : null
  return {
    slug: hit.slug,
    title: hit.title.replace(/⁠/g, '').trim(),
    image: enriched?.image ?? hit.image,
    instructor: enriched?.instructor ?? hit.instructors[0] ?? null,
    avatar: enriched?.avatar ?? null,
    lessons: enriched?.lessons ?? null,
    duration: enriched?.duration ?? (hit.duration_minutes ? formatDuration(hit.duration_minutes * 60) : null),
  }
}

function fromProgram(program: ApiB2BProgram): PathCourse {
  const trainer = program.trainers[0]
  return {
    slug: program.slug ?? program.program_id,
    title: program.title.replace(/⁠/g, '').trim(),
    image: program.image_url,
    instructor: trainer?.name ?? null,
    avatar: trainer?.avatar_url ?? null,
    lessons: program.lesson_count || null,
    duration: formatDuration(program.duration_seconds),
  }
}

/** Small stable hash so each selection shows a different slice of the track. */
function spread(value: string) {
  let hash = 0
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash
}

/**
 * B2B library first: keyword matches for the competency and the gap (across the
 * whole library), topped up with programs from the track's combined categories.
 * Throws when the B2B endpoints are unavailable so the catalog chain takes over.
 */
async function loadB2BCourses(competency: string, gap: string, track: string | undefined): Promise<PathCourse[]> {
  const results = await Promise.allSettled([
    fetchB2BCourses({ q: competency, limit: COUNT }),
    competency === gap ? Promise.resolve(null) : fetchB2BCourses({ q: gap, limit: COUNT }),
    track ? fetchB2BCourses({ track, limit: 12 }) : Promise.resolve(null),
  ])
  const pages = results.map((result) => (result.status === 'fulfilled' ? result.value : null))
  if (results.every((result) => result.status === 'rejected')) throw new Error('b2b unavailable')

  const [byCompetency, byGap, byTrack] = pages.map((page) => page?.items ?? [])
  const fill = byTrack.length ? byTrack.map((_, i) => byTrack[(i + spread(competency + gap)) % byTrack.length]) : []
  const seen = new Set<string>()
  const picked: ApiB2BProgram[] = []
  const rounds = Math.max(byCompetency.length, byGap.length)
  const ordered = [
    ...Array.from({ length: rounds }, (_, i) => [byCompetency[i], byGap[i]]).flat(),
    ...fill,
  ]
  for (const program of ordered) {
    // A program and a standalone course can share a slug (legacy linkName); keep one.
    const slug = program?.slug ?? program?.program_id
    if (!program || !slug || seen.has(program.program_id) || seen.has(slug)) continue
    seen.add(program.program_id)
    seen.add(slug)
    picked.push(program)
    if (picked.length === COUNT) break
  }
  if (picked.length === 0) throw new Error('no b2b programs')
  return picked.map(fromProgram)
}

/** Interleave two relevance lists (a, b, a, b…) without duplicates. */
function interleave(a: ApiSearchHit[], b: ApiSearchHit[]) {
  const seen = new Set<string>()
  const out: ApiSearchHit[] = []
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    for (const hit of [a[i], b[i]]) {
      if (hit && !seen.has(hit.slug)) {
        seen.add(hit.slug)
        out.push(hit)
      }
    }
  }
  return out
}

async function loadPathCourses(competency: string, gap: string): Promise<PathCourse[]> {
  const [byCompetency, byGap] = await Promise.all([
    searchCourses(competency, COUNT).catch(() => null),
    competency === gap ? Promise.resolve(null) : searchCourses(gap, COUNT).catch(() => null),
  ])
  const hits = interleave(byCompetency?.items ?? [], byGap?.items ?? []).slice(0, COUNT)
  if (hits.length === 0) throw new Error('no hits')

  const cards = await fetchCardsBySlugs(hits.map((hit) => hit.slug)).catch(() => null)
  const bySlug = new Map((cards?.items ?? []).map((card) => [card.slug, card]))
  return hits.map((hit) => fromHit(hit, bySlug.get(hit.slug)))
}

/**
 * Real Mastery courses for the path builder. Primary source is the public B2B
 * library (`/b2b/courses`: keyword + track of combined categories, with trainer
 * avatars). If that API is unavailable it searches the B2C catalog for the chosen
 * competency and gap, then the newest sales courses, then the bundled snapshot.
 */
export function usePathCourses(competency: string, gap: string, track?: string) {
  const [courses, setCourses] = useState<PathCourse[]>([])
  const [status, setStatus] = useState<PathCoursesStatus>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    const timer = window.setTimeout(() => {
      loadB2BCourses(competency, gap, track)
        .catch(() => loadPathCourses(competency, gap))
        .then((items) => {
          if (cancelled) return
          setCourses(items)
          setStatus('live')
        })
        .catch(async () => {
          const page = await fetchSalesProductCards(COUNT).catch(() => null)
          if (cancelled) return
          const items = (page?.items.length ? page.items : fallbackProducts)
            .map(fromCard)
            .filter((item): item is PathCourse => item !== null)
            .slice(0, COUNT)
          setCourses(items)
          setStatus(page?.items.length ? 'live' : 'fallback')
        })
    }, 450)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [competency, gap, track])

  return { courses, status }
}

/** The curated B2B track (name + its combined fields), or null when unavailable. */
export function useB2BTrack(key: string | undefined) {
  const [track, setTrack] = useState<ApiB2BTrack | null>(null)

  useEffect(() => {
    if (!key) {
      setTrack(null)
      return
    }
    let cancelled = false
    fetchB2BTracks()
      .then((page) => {
        if (!cancelled) setTrack(page.items.find((item) => item.key === key) ?? null)
      })
      .catch(() => {
        if (!cancelled) setTrack(null)
      })
    return () => {
      cancelled = true
    }
  }, [key])

  return track
}
