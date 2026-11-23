import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../lib/cx'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'

/**
 * Scroll the rail so card `index` fills it. Cards are 100% wide, so aligning
 * the card's left edge with the rail's is both "center" and RTL-safe — and it
 * never scrolls the document (unlike scrollIntoView).
 */
function scrollRailTo(rail: HTMLDivElement | null, index: number, behavior: ScrollBehavior) {
  const card = rail?.children[index]
  if (!rail || !(card instanceof HTMLElement)) return
  rail.scrollTo({ left: card.offsetLeft, behavior })
}

type DeckProps = {
  children: ReactNode[]
  /** Accessible name for the deck. */
  label: string
  className?: string
  /** Auto-advance interval in ms (0 disables it). */
  autoMs?: number
}

/**
 * One-card-at-a-time deck for long lists on small screens: native
 * scroll-snap (swipe works untouched), dots, and a self-advancing loop that
 * pauses on interaction or when off-screen. Designed for the mobile compare
 * table so the section is one card tall instead of eight.
 */
export function Deck({ children, label, className, autoMs = 4500 }: DeckProps) {
  const reduce = usePrefersReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.25 })
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  const total = children.length

  const goTo = useCallback((index: number) => {
    scrollRailTo(railRef.current, index, reduce ? 'auto' : 'smooth')
    setActive(index)
  }, [reduce])

  // Track which card is centered (native swipe / programmatic scroll).
  useEffect(() => {
    const rail = railRef.current
    if (!rail || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const index = Array.from(rail.children).indexOf(visible.target)
        if (index >= 0) setActive(index)
      },
      { root: rail, threshold: [0.55, 0.75] },
    )
    Array.from(rail.children).forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [total])

  // Auto-advance while visible and untouched.
  useEffect(() => {
    if (reduce || autoMs <= 0 || paused || held || total < 2) return
    const timer = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % total
        scrollRailTo(railRef.current, next, 'smooth')
        return next
      })
    }, autoMs)
    return () => window.clearInterval(timer)
  }, [reduce, autoMs, paused, held, total])

  const hold = () => setHeld(true)
  const release = () => setHeld(false)

  return (
    <div
      className={cn('deck', className)}
      role="group"
      aria-label={label}
      ref={ref}
      {...hoverProps}
      onPointerDown={hold}
      onPointerUp={release}
      onPointerCancel={release}
      onTouchEnd={release}
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      <div className="deck__rail" ref={railRef}>
        {children.map((child, index) => (
          <div className="deck__card" key={index} aria-hidden={index !== active}>
            {child}
          </div>
        ))}
      </div>
      <div className="deck__dots" role="tablist" aria-label={label}>
        {children.map((_, index) => (
          <button
            className="deck__dot"
            key={index}
            type="button"
            role="tab"
            aria-selected={index === active}
            aria-label={`البطاقة ${index + 1} من ${total}`}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  )
}
