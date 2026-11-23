import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { loadGsap } from './gsap'

type Options = {
  /** Viewport width (max, px) below which the pinned pan runs. */
  breakpoint?: number
  /** Scrubbed pin distance as a factor of the horizontal travel. */
  speed?: number
}

/**
 * Small screens only: the reference horizontal-pan pattern (Framer/GSAP).
 * The block pins and its track slides sideways as the page scrolls, so a long
 * row of panels takes one card-height of the page instead of eight.
 *
 * RTL-aware: the flex track runs right-to-left, so the track slides *right*
 * (positive x) to reveal the next panel.
 *
 * Structure: the ref element must contain one `.h-pan__track` whose children
 * are the panels. Desktop, reduced motion or a failed import leave the list
 * untouched (reduced motion makes it a native swipe row).
 */
export function useHorizontalPan<T extends HTMLElement>({ breakpoint = 899, speed = 0.9 }: Options = {}) {
  const ref = useRef<T>(null)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || reduce) return

    let cancelled = false
    let cleanup = () => {}

    const run = async () => {
      const { gsap, ScrollTrigger } = await loadGsap()
      if (cancelled) return

      const mm = gsap.matchMedia()

      mm.add(`(max-width: ${breakpoint}px)`, () => {
        const track = node.querySelector<HTMLElement>('.h-pan__track')
        if (!track || track.children.length < 2) return

        const travel = () => Math.max(0, track.scrollWidth - node.clientWidth)
        const direction = getComputedStyle(node).direction === 'rtl' ? 1 : -1
        if (travel() <= 0) return

        const tween = gsap.fromTo(
          track,
          { x: 0 },
          {
            x: () => travel() * direction,
            ease: 'none',
            scrollTrigger: {
              trigger: node,
              start: 'top 15%',
              end: () => `+=${travel() * speed + 120}`,
              scrub: 0.45,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                node.style.setProperty('--pan-progress', self.progress.toFixed(3))
              },
            },
          },
        )

        node.classList.add('is-panning')

        let disposed = false
        const onLoad = () => {
          if (!disposed) ScrollTrigger.refresh()
        }
        window.addEventListener('load', onLoad, { once: true })
        document.fonts?.ready.then(onLoad).catch(() => {})
        const raf = window.requestAnimationFrame(() => {
          if (!disposed) ScrollTrigger.refresh()
        })

        return () => {
          disposed = true
          window.cancelAnimationFrame(raf)
          window.removeEventListener('load', onLoad)
          tween.scrollTrigger?.kill()
          tween.kill()
          gsap.set(track, { clearProps: 'transform' })
          node.classList.remove('is-panning')
          node.style.removeProperty('--pan-progress')
        }
      })

      cleanup = () => mm.revert()
    }

    void run().catch(() => {
      // Native overflow scrolling stays available.
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [breakpoint, speed, reduce])

  return ref
}
