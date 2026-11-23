import type { gsap as GsapType } from 'gsap'
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger'

type Loaded = { gsap: typeof GsapType; ScrollTrigger: typeof ScrollTriggerType }

let pending: Promise<Loaded> | null = null

/** Breakpoints shared by every gsap.matchMedia() call. */
export const MQ = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  motionOk: '(prefers-reduced-motion: no-preference)',
} as const

/**
 * Lazy GSAP + ScrollTrigger, registered and configured exactly once so all
 * sections share one ticker, one refresh cycle and the same mobile settings.
 */
export function loadGsap(): Promise<Loaded> {
  if (!pending) {
    pending = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, stModule]) => {
      const gsap = gsapModule.gsap
      const ScrollTrigger = stModule.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)
      // Mobile URL-bar show/hide must not re-layout every trigger.
      ScrollTrigger.config({ ignoreMobileResize: true })
      gsap.defaults({ ease: 'power3.out' })
      const refresh = () => ScrollTrigger.refresh()
      window.addEventListener('load', refresh, { once: true })
      void document.fonts?.ready.then(refresh)
      return { gsap, ScrollTrigger }
    })
    pending.catch(() => {
      pending = null
    })
  }
  return pending
}
