import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type Options = {
  /** Viewport width (max, px) below which the deck is stacked and pinned. */
  breakpoint?: number
  /** How much of each following card peeks under the top one (px). */
  peek?: number
  /** Scroll distance per card step (px, clamped by viewport height). */
  step?: number
}

/**
 * Small screens only: turn a list of cards into a pinned, scroll-driven stack
 * (GSAP + ScrollTrigger, loaded on demand). The section becomes one card tall
 * and each scroll step reveals the next card on top of the deck; a hairline
 * progress bar under the deck tracks the step.
 *
 * Mobile hardening:
 * - `ignoreMobileResize` so the browser URL-bar collapse never re-triggers a
 *   refresh mid-scroll (that caused the pinned deck to jump);
 * - the deck height is re-measured after fonts/images land and on refresh;
 * - a refresh runs on the next frame so late (lazy) page content cannot leave
 *   the trigger with stale start/end positions.
 *
 * Progressive enhancement — desktop, reduced motion or a failed import leave
 * the plain list untouched. Pass a ref to the element whose *direct children*
 * are the cards; wrap each card in a plain div if another library animates it.
 */
export function useCardStack<T extends HTMLElement>({ breakpoint = 767, peek = 9, step = 260 }: Options = {}) {
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
      // The mobile URL bar collapsing resizes the viewport; refreshing on that
      // makes a pinned deck jump. Ignore it.
      ScrollTrigger.config({ ignoreMobileResize: true })

      const mm = gsap.matchMedia()

      mm.add(`(max-width: ${breakpoint}px)`, () => {
        const cards = Array.from(node.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement,
        )
        if (cards.length < 2) return

        const measure = () => {
          // scrollHeight still reports the full content height while the cards
          // are absolutely stacked, so this is safe to call on every refresh.
          const height = Math.max(...cards.map((card) => card.scrollHeight), 160)
          node.style.height = `${height}px`
        }

        node.classList.add('is-stacked')
        node.style.setProperty('--stack-progress', '0')
        measure()

        cards.forEach((card, index) => {
          gsap.set(card, {
            position: 'absolute',
            top: 0,
            insetInlineStart: 0,
            width: '100%',
            height: '100%',
            zIndex: cards.length - index,
            y: peek * index,
          })
        })

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: node,
            start: 'top 12%',
            end: () => `+=${(cards.length - 1) * Math.min(window.innerHeight * 0.45, step)}`,
            scrub: 0.4,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: measure,
            onUpdate: (self) => {
              node.style.setProperty('--stack-progress', self.progress.toFixed(3))
            },
          },
        })

        cards.slice(1).forEach((_card, offset) => {
          const leaving = cards[offset]
          if (!leaving) return
          timeline.to(
            leaving,
            { yPercent: -18, opacity: 0, scale: 0.96, duration: 1, ease: 'none' },
            offset,
          )
          timeline.to(cards[offset + 1], { y: 0, duration: 1, ease: 'none' }, offset)
          cards.slice(offset + 2).forEach((card, ahead) => {
            timeline.to(card, { y: peek * (ahead + 1), duration: 1, ease: 'none' }, offset)
          })
        })

        // Late fonts/images change heights; refresh once they settle.
        const refresh = () => {
          measure()
          ScrollTrigger.refresh()
        }
        let disposed = false
        const onLoad = () => {
          if (!disposed) refresh()
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
          node.classList.remove('is-stacked')
          node.style.height = ''
          node.style.removeProperty('--stack-progress')
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
  }, [breakpoint, peek, step, reduce])

  return ref
}
