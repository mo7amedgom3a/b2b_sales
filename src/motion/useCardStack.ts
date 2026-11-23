import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Options = {
  /** Viewport width (max, px) below which the cards stick and recede. */
  breakpoint?: number
  /** Backward tilt applied to every card except the last. */
  rotation?: number
  /** Scale of the first recessed card, then +scaleStep per card. */
  scaleBase?: number
  scaleStep?: number
}

/**
 * Small screens only: the reference "stacked cards" look (Framer/GSAP), built
 * on **sticky** wrappers instead of ScrollTrigger pinning.
 *
 * Every card sticks under the sticky header while the next ones scroll over
 * it; as the next card arrives, the current one tilts back (`rotationX`, top
 * origin) and shrinks — the exact transform recipe of the reference demo.
 * Sticky is used instead of `pin` because ScrollTrigger switches to
 * transform-pinning on touch devices, which cannot stack cards with
 * `pinSpacing: false`.
 *
 * Pass a ref to the element whose *direct children* are the card wrappers; the
 * card that gets transformed is the first element inside `.stack__card`.
 *
 * Desktop, reduced motion or a failed import leave the plain list untouched.
 */
export function useCardStack<T extends HTMLElement>({
  breakpoint = 767,
  rotation = -10,
  scaleBase = 0.9,
  scaleStep = 0.025,
}: Options = {}) {
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

        wrappers.forEach((wrapper, index) => {
          if (index === wrappers.length - 1) return
          const card = (wrapper.querySelector<HTMLElement>('.stack__card > *') ??
            wrapper.firstElementChild ??
            wrapper) as HTMLElement
          const next = wrappers[index + 1]
          if (!next) return

          gsap.fromTo(
            card,
            { scale: 1, rotationX: 0 },
            {
              scale: scaleBase + scaleStep * index,
              rotationX: rotation,
              transformOrigin: 'top center',
              transformPerspective: 900,
              ease: 'none',
              scrollTrigger: {
                trigger: next,
                start: 'top 88%',
                end: 'top 30%',
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
  }, [breakpoint, rotation, scaleBase, scaleStep, reduce])

  return ref
}
