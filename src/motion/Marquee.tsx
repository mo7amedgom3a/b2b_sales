import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { loadGsap } from './gsap'

type MarqueeProps = {
  children: ReactNode
  label?: string
  className?: string
}

/**
 * Client-logo belt, styled after the Framer reference (landing.css): masked
 * edges at 10%/90%, 56px gaps, 44px logos. The loop itself follows the Framer
 * GSAP behaviour — `xPercent: -50`, 50s, paused while off-screen and slowed to
 * 0.15× on pointer hover. CSS keyframes are the no-JS / reduced-motion
 * fallback (`.marquee--gsap` turns them off once GSAP takes over).
 */
export function Marquee({ children, label, className }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cancelled = false
    let cleanup = () => {}

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        const root = track.parentElement
        root?.classList.add('marquee--gsap')

        // Shorter loop on phones so the belt doesn't feel stalled on a narrow screen.
        const duration = window.matchMedia('(max-width: 767px)').matches ? 34 : 50
        const loop = gsap.to(track, { xPercent: -50, duration, ease: 'none', repeat: -1 })
        // Start deep into the infinite repeat so a reverse push never hits time 0.
        loop.totalTime(duration * 500)
        let hovering = false
        const slow = () => {
          hovering = true
          gsap.to(loop, { timeScale: 0.15, duration: 0.6 })
        }
        const normal = () => {
          hovering = false
          gsap.to(loop, { timeScale: 1, duration: 0.6 })
        }
        track.addEventListener('pointerenter', slow)
        track.addEventListener('pointerleave', normal)

        // Scrolling gives the belt a short push in the scroll direction, then it eases back.
        const push = ScrollTrigger.create({
          trigger: track,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            if (hovering) return
            const boost = Math.min(Math.abs(self.getVelocity()) / 350, 4)
            const sign = self.direction < 0 ? -1 : 1
            gsap
              .timeline({ overwrite: true })
              .to(loop, { timeScale: sign * (1 + boost), duration: 0.2, ease: 'power1.out' })
              .to(loop, { timeScale: 1, duration: 1.1, ease: 'power2.out' })
          },
        })

        let observer: IntersectionObserver | undefined
        if (typeof IntersectionObserver !== 'undefined') {
          observer = new IntersectionObserver(
            (entries) => {
              const entry = entries[0]
              if (!entry) return
              if (entry.isIntersecting) loop.play()
              else loop.pause()
            },
            { threshold: 0 },
          )
          observer.observe(track)
        }

        cleanup = () => {
          observer?.disconnect()
          push.kill()
          track.removeEventListener('pointerenter', slow)
          track.removeEventListener('pointerleave', normal)
          loop.kill()
          root?.classList.remove('marquee--gsap')
        }
      })
      .catch(() => {
        // CSS keyframes keep the belt moving.
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return (
    <div className={className ? `marquee ${className}` : 'marquee'} role="region" aria-label={label}>
      <div className="marquee__track" ref={trackRef}>
        <div className="marquee__group">{children}</div>
        <div className="marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
