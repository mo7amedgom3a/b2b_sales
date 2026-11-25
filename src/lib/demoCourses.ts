import { useEffect, useState } from 'react'
import { fetchB2BCourses } from './api'
import type { ApiB2BProgram } from './api'
import { formatDuration } from './format'

export type DemoCourse = {
  id: string
  title: string
  image: string | null
  instructor: string | null
  avatar: string | null
  lessons: number
  duration: string | null
}

function toDemoCourse(program: ApiB2BProgram): DemoCourse | null {
  const title = program.title?.replace(/\u2060/g, '').trim()
  if (!title) return null
  const trainer = program.trainers[0]
  return {
    id: program.slug ?? program.program_id,
    title,
    image: program.image_url,
    instructor: trainer?.name.trim() || null,
    avatar: trainer?.avatar_url ?? null,
    lessons: program.lesson_count,
    duration: formatDuration(program.duration_seconds),
  }
}

/**
 * Real B2B library programs («المبيعات والنمو» track) for the demo tables (planning, training,
 * dashboard). The caller keeps its static mock rows until this resolves, and
 * forever if the API is unreachable. The request is delayed so it never
 * competes with the LCP window.
 */
export function useDemoCourses(limit = 6) {
  const [courses, setCourses] = useState<DemoCourse[]>([])
  const [live, setLive] = useState(false)

  useEffect(() => {
    let cancelled = false
    const timer = window.setTimeout(() => {
      // Programs carry their trainer; standalone B2B courses don't, so ask for programs.
      fetchB2BCourses({ track: 'sales-growth', kind: 'program', limit })
        .then((page) => {
          if (cancelled) return
          const items = page.items
            .map(toDemoCourse)
            .filter((item): item is DemoCourse => item !== null)
          if (items.length > 0) {
            setCourses(items)
            setLive(true)
          }
        })
        .catch(() => {
          // Keep the static demo rows.
        })
    }, 900)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [limit])

  return { courses, live }
}
