import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Options = {
  /** Viewport width (max, px) below which the cards pile up. */
  breakpoint?: number
  /** Vertical offset between piled card edges (px). */
  edge?: number
}

/**
 * Small screens only: vertical "stacked cards" animation.
 *
 * Each card sticks under the header at a slightly lower top than the previous
 * one (`--stack-index`), so the pile shows a thin edge of every card. As a card
 * scrolls in, it rises into place from below with a small alternating tilt
 * (GSAP scrub) and then settles under the next one. This replaces the earlier
 * tilt-back recession with a distinct rise-and-pile motion.
 *
 * Pass a ref to the element whose *direct children* are the card wrappers; the
 * card that gets transformed is the first element inside `.stack__card`.
 *
 * Desktop, reduced motion or a failed import leave the plain list untouched.
 */
export function useCardStack<T extends HTMLElement>({ breakpoint = 767, edge = 12 }: Options = {}) {
  const ref = useRef<T>(null)
  const reduce = usePrefersReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || reduce) return

    let cancelled = false
    let cleanup = () => {}

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ])
      if (cancelled) return

      gsap.registerPlugin(ScrollTrigger)
      ScrollTrigger.config({ ignoreMobileResize: true })

      const mm = gsap.matchMedia()

      mm.add(`(max-width: ${breakpoint}px)`, () => {
        const wrappers = Array.from(node.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement,
        )
        if (wrappers.length < 2) return

        node.classList.add('is-stacked')
        node.style.setProperty('--stack-edge', `${edge}px`)

        wrappers.forEach((wrapper, index) => {
          wrapper.style.setProperty('--stack-index', String(index))
          const card = (wrapper.querySelector<HTMLElement>('.stack__card > *') ??
            wrapper.firstElementChild ??
            wrapper) as HTMLElement
          const direction = index % 2 === 0 ? 1 : -1

          gsap.fromTo(
            card,
            { y: 56, rotate: 1.8 * direction, scale: 0.975, transformOrigin: 'center bottom' },
            {
              y: 0,
              rotate: 0,
              scale: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: wrapper,
                start: 'top 96%',
                end: 'top 38%',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )
        })

        const refresh = () => ScrollTrigger.refresh()
        let disposed = false
        const onLoad = () => {
          if (!disposed) refresh()
        }
        window.addEventListener('load', onLoad, { once: true })
        document.fonts?.ready.then(onLoad).catch(() => {})
        const raf = window.requestAnimationFrame(() => {
          if (!disposed) refresh()
        })

        return () => {
          disposed = true
          window.cancelAnimationFrame(raf)
          window.removeEventListener('load', onLoad)
          wrappers.forEach((wrapper) => wrapper.style.removeProperty('--stack-index'))
          node.style.removeProperty('--stack-edge')
          node.classList.remove('is-stacked')
        }
      })

      cleanup = () => mm.revert()
    }

    void run().catch(() => {
      // Plain list stays; the stack is progressive enhancement.
    })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [breakpoint, edge, reduce])

  return ref
}
