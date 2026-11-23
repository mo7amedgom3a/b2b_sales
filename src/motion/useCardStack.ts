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
 * and each scroll step reveals the next card on top of the deck.
 *
 * Progressive enhancement — desktop, reduced motion or a failed import leave
 * the plain list untouched. Pass a ref to the element whose *direct children*
 * are the cards; wrap each card in a plain div if another library animates it.
 */
export function useCardStack<T extends HTMLElement>({ breakpoint = 767, peek = 9, step = 300 }: Options = {}) {
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

      const mm = gsap.matchMedia()

      mm.add(`(max-width: ${breakpoint}px)`, () => {
        const cards = Array.from(node.children).filter(
          (child): child is HTMLElement => child instanceof HTMLElement,
        )
        if (cards.length < 2) return

        node.classList.add('is-stacked')
        const heights = cards.map((card) => card.getBoundingClientRect().height)
        const deckHeight = Math.max(...heights, 160)
        node.style.height = `${deckHeight}px`

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
            end: () => `+=${(cards.length - 1) * Math.min(window.innerHeight * 0.55, step)}`,
            scrub: 0.45,
            pin: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
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

        return () => {
          node.classList.remove('is-stacked')
          node.style.height = ''
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
