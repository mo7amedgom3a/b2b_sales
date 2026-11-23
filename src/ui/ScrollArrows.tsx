import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { ReactNode, RefObject } from 'react'

/**
 * Tracks whether a horizontal scroller has hidden items before/after the
 * visible part. Works in RTL (where scrollLeft runs 0 → negative).
 */
export function useScrollEdges(ref: RefObject<HTMLElement | null>) {
  const [edges, setEdges] = useState({ start: false, end: false })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    const pos = Math.abs(el.scrollLeft)
    setEdges({ start: pos > 4, end: max > 4 && pos < max - 4 })
  }, [ref])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    observer?.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      observer?.disconnect()
    }
  }, [ref, measure])

  /** Scroll by ~70% of the visible width toward the start (-1) or the end (+1). */
  const scroll = useCallback(
    (towards: -1 | 1) => {
      const el = ref.current
      if (!el) return
      const rtl = getComputedStyle(el).direction === 'rtl'
      el.scrollBy({ left: towards * (rtl ? -1 : 1) * el.clientWidth * 0.7, behavior: 'smooth' })
    },
    [ref],
  )

  return { ...edges, scroll }
}

/**
 * Wraps a horizontal scroller with edge fades and chevron buttons that only
 * show when there is more to see in that direction — so visitors notice the
 * hidden options on small screens.
 */
export function ScrollArrows({
  scrollerRef,
  children,
  className,
  label = 'خيارات أخرى',
}: {
  scrollerRef: RefObject<HTMLElement | null>
  children: ReactNode
  className?: string
  label?: string
}) {
  const { start, end, scroll } = useScrollEdges(scrollerRef)
  const classes = ['scroll-arrows', start && 'has-start', end && 'has-end', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {children}
      {/* RTL: the start is on the right, "more" is on the left. */}
      <button
        type="button"
        className="scroll-arrows__btn scroll-arrows__btn--start"
        onClick={() => scroll(-1)}
        aria-label={`${label} — السابق`}
        tabIndex={start ? 0 : -1}
        aria-hidden={!start}
      >
        <ChevronRight aria-hidden="true" />
      </button>
      <button
        type="button"
        className="scroll-arrows__btn scroll-arrows__btn--end"
        onClick={() => scroll(1)}
        aria-label={`${label} — التالي`}
        tabIndex={end ? 0 : -1}
        aria-hidden={!end}
      >
        <ChevronLeft aria-hidden="true" />
      </button>
    </div>
  )
}
