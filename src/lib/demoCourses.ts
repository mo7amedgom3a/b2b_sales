import { useEffect, useState } from 'react'
import { fetchSalesProductCards } from './api'
import type { ApiProductCard } from './api'
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

function toDemoCourse(card: ApiProductCard): DemoCourse | null {
  const title = card.title?.trim()
  if (!title) return null
  return {
    id: card.slug,
    title,
    image: card.image,
    instructor: card.instructor_name?.trim() || null,
    avatar: card.instructor_avatar,
    lessons: card.lesson_count,
    duration: formatDuration(card.duration_seconds),
  }
}

/**
 * Real sales-catalog courses for the hero demo tables (planning, training,
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
      fetchSalesProductCards(limit)
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
