import { useEffect } from 'react'
import type { RefObject } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { loadGsap, MQ } from './gsap'

/**
 * Page-wide GSAP scroll layer for the sections below the hero.
 *
 * - `[data-fx="rise"]` items enter in staggered batches (ScrollTrigger.batch),
 *   replay when scrolled back to, and reset once they leave below the fold.
 * - Section-title underlines draw in with the scroll (scrubbed `--line-draw`).
 * - `[data-fx="parallax"]` media drift slightly against the scroll (desktop only).
 *
 * Phones get shorter, transform-only motion; reduced motion skips it all.
 */
export function useScrollFx(rootRef: RefObject<HTMLElement | null>, ready = true) {
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const root = rootRef.current
    if (!root || reduce || !ready) return

    let cancelled = false
    let cleanup = () => {}

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        const mm = gsap.matchMedia()

        mm.add({ mobile: MQ.mobile, desktop: '(min-width: 768px)' }, (context) => {
          const { mobile } = context.conditions as { mobile: boolean; desktop: boolean }
          const distance = mobile ? 18 : 32

          const items = gsap.utils.toArray<HTMLElement>('[data-fx="rise"]', root)
          gsap.set(items, { opacity: 0, y: distance })
          ScrollTrigger.batch(items, {
            start: 'top 92%',
            interval: 0.08,
            batchMax: mobile ? 3 : 6,
            onEnter: (batch) =>
              gsap.to(batch, { opacity: 1, y: 0, duration: mobile ? 0.45 : 0.6, stagger: 0.07, overwrite: true }),
            onEnterBack: (batch) =>
              gsap.to(batch, { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, overwrite: true }),
            onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: distance, overwrite: true }),
          })

          gsap.utils.toArray<HTMLElement>('.ma-sechead__title', root).forEach((title) => {
            gsap.fromTo(
              title,
              { '--line-draw': 0 },
              {
                '--line-draw': 1,
                ease: 'none',
                scrollTrigger: { trigger: title, start: 'top 92%', end: 'top 45%', scrub: 0.6 },
              },
            )
          })

          if (!mobile) {
            gsap.utils.toArray<HTMLElement>('[data-fx="parallax"]', root).forEach((media) => {
              gsap.fromTo(
                media,
                { yPercent: -4 },
                {
                  yPercent: 4,
                  ease: 'none',
                  scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: true },
                },
              )
            })
          }

          return () => {
            gsap.set(items, { clearProps: 'opacity,transform' })
          }
        })

        ScrollTrigger.refresh()
        cleanup = () => mm.revert()
      })
      .catch(() => {
        // Content is fully visible without the scroll layer.
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [rootRef, reduce, ready])
}
