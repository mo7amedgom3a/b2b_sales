import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

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

    void import('gsap')
      .then(({ gsap }) => {
        if (cancelled) return
        const root = track.parentElement
        root?.classList.add('marquee--gsap')

        const loop = gsap.to(track, { xPercent: -50, duration: 50, ease: 'none', repeat: -1 })
        const slow = () => gsap.to(loop, { timeScale: 0.15, duration: 0.6 })
        const normal = () => gsap.to(loop, { timeScale: 1, duration: 0.6 })
        track.addEventListener('pointerenter', slow)
        track.addEventListener('pointerleave', normal)

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
