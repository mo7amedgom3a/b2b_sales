import { useEffect, useState } from 'react'
import { b2bSnapshot } from '../content/b2bSnapshot'
import { fetchB2BCourses, fetchB2BTracks } from './api'
import type { ApiB2BProgram, ApiB2BTrack } from './api'
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
 * Throws when the B2B endpoints are unavailable (the caller then uses the B2B snapshot).
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

/**
 * Real Mastery courses for the path builder, from the B2B library only
 * (`/b2b/courses`: keyword matches across the library, topped up from the
 * track's combined categories, with trainer avatars). If that API is
 * unreachable it shows the bundled B2B snapshot.
 */
export function usePathCourses(competency: string, gap: string, track?: string) {
  const [courses, setCourses] = useState<PathCourse[]>([])
  const [status, setStatus] = useState<PathCoursesStatus>('loading')

  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    const timer = window.setTimeout(() => {
      loadB2BCourses(competency, gap, track)
        .then((items) => {
          if (cancelled) return
          setCourses(items)
          setStatus('live')
        })
        .catch(() => {
          if (cancelled) return
          const offset = spread(competency + gap) % b2bSnapshot.length
          const rotated = [...b2bSnapshot.slice(offset), ...b2bSnapshot.slice(0, offset)]
          setCourses(rotated.slice(0, COUNT).map(fromProgram))
          setStatus('fallback')
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
