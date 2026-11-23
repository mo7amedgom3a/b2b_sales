import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { useInViewOnce } from '../hooks/useInViewOnce'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { loadGsap, MQ } from './gsap'

/**
 * DELIBERATE KIT EXCEPTION (human request, Nov 2026):
 * section text gets a frosted-glass plate plus a sheen and a blur reveal each time
 * it scrolls into view (lighter, blur-free slide on phones). GSAP is loaded only when a title is about to enter,
 * so the hero's initial payload stays lean. Disabled under reduced motion.
 */
export function GlassText({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = usePrefersReducedMotion()
  const { ref, inView } = useInViewOnce<HTMLSpanElement>(0.04)

  useEffect(() => {
    if (!inView || reduce) return

    let cancelled = false
    let cleanup = () => {}

    const run = async () => {
      const { gsap, ScrollTrigger } = await loadGsap()
      if (cancelled) return

      const el = ref.current
      if (!el) return

      const panel = el.querySelector<HTMLElement>('.glass-panel')
      const sheen = el.querySelector<HTMLElement>('.glass-sheen')

      // Plays on enter, replays when scrolled back to, resets once it leaves below.
      const mobile = window.matchMedia(MQ.mobile).matches
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 95%',
          end: 'bottom top',
          toggleActions: 'restart none restart reset',
        },
      })

      timeline
        .fromTo(
          el,
          mobile ? { y: 14, opacity: 0 } : { x: 28, opacity: 0, filter: 'blur(10px)' },
          mobile
            ? { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
            : { x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' },
        )
        .fromTo(
          panel,
          { opacity: 0, scaleX: 0.96 },
          { opacity: 1, scaleX: 1, duration: 0.55, ease: 'power2.out' },
          0.05,
        )
        .fromTo(
          sheen,
          { backgroundPosition: '140% 0' },
          { backgroundPosition: '-40% 0', duration: 1.1, ease: 'power2.inOut' },
          0.12,
        )

      ScrollTrigger.refresh()
      cleanup = () => {
        timeline.scrollTrigger?.kill()
        timeline.kill()
      }
    }

    void run().catch(() => {
      // Text stays visible; the glass is progressive enhancement.
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [inView, reduce, ref])

  return (
    <span ref={ref} className={`glass-text ${className ?? ''}`}>
      <span className="glass-panel" aria-hidden="true" />
      <span className="glass-text__inner">{children}</span>
      <span className="glass-sheen" aria-hidden="true" />
    </span>
  )
}
