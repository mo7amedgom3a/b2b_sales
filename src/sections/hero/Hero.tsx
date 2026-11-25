import { ArrowRight, Clock3 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { hero, video } from '../../content/ar'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { loadGsap } from '../../motion/gsap'
import { Button } from '../../ui/Button'
import { HeroRotator } from './HeroRotator'
import { HeroVideoFrame, HeroVideoSpeakers } from './HeroVideo'

/** Scale of the video window while it peeks under the CTA (it expands to 1 on scroll). */
const START_SCALE = { phone: 0.9, wide: 0.78 }

/**
 * One pinned stage (jisr-style): the copy on top, the video window peeking
 * just under the CTA. Scrolling expands the window toward the centre while
 * the copy dims, blurs and recedes, and the video headline fades in above
 * it; scrolling back shrinks it again. Everything is scrubbed by scroll.
 */
export function Hero() {
  const reduce = usePrefersReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  // The YouTube player waits for the first scroll (or a quiet moment), so it never competes with the hero's first paint.
  const [activate, setActivate] = useState(false)

  useEffect(() => {
    const on = () => setActivate(true)
    const timer = window.setTimeout(on, 2500)
    window.addEventListener('scroll', on, { once: true, passive: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', on)
    }
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track || reduce) return
    let cancelled = false
    let cleanup = () => {}

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        const stage = track.querySelector<HTMLElement>('.hero__stage')
        const copy = track.querySelector<HTMLElement>('.hero__copy')
        const swap = track.querySelector<HTMLElement>('.hero__swap')
        const frame = track.querySelector<HTMLElement>('.hero__window')
        const glow = track.querySelector<HTMLElement>('.hero__glow')
        const speakers = track.querySelector<HTMLElement>('.hero__speakers')
        if (!stage || !copy || !swap || !frame || !speakers) return

        const mm = gsap.matchMedia()
        mm.add({ phone: '(max-width: 767px)', wide: '(min-width: 768px)' }, (context) => {
          const { phone } = context.conditions as { phone: boolean; wide: boolean }
          const gap = phone ? 14 : 20
          // Settled: headline, window and speakers as one group — centred on wide
          // screens; on phones it sits at the bottom, so the window expands almost
          // in place (under the fading copy) and the next section follows directly.
          const groupH = () => swap.offsetHeight + gap + frame.offsetHeight + gap + speakers.offsetHeight
          const groupTop = () =>
            Math.max(12, phone ? stage.clientHeight - groupH() - 20 : (stage.clientHeight - groupH()) / 2)
          const frameTop = () => groupTop() + swap.offsetHeight + gap
          const frameEndY = () => frameTop() - frame.offsetTop
          const speakersTop = () => frameTop() + frame.offsetHeight + gap

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: track,
              start: () => `top top+=${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72}`,
              end: 'bottom bottom',
              scrub: phone ? 0.5 : 0.8,
              invalidateOnRefresh: true,
            },
          })
          timeline
            .fromTo(
              frame,
              { y: 0, scale: phone ? START_SCALE.phone : START_SCALE.wide },
              { y: frameEndY, scale: 1, duration: 1, ease: 'power2.inOut' },
              0,
            )
            .to(copy, { autoAlpha: 0, y: phone ? -30 : -60, scale: 0.94, filter: 'blur(8px)', duration: 0.5 }, 0)
            .fromTo(swap, { autoAlpha: 0, y: () => groupTop() + 24 }, { autoAlpha: 1, y: groupTop, duration: 0.35 }, 0.45)
            .fromTo(speakers, { autoAlpha: 0, y: () => speakersTop() + 16 }, { autoAlpha: 1, y: speakersTop, duration: 0.35 }, 0.55)
          if (glow) timeline.to(glow, { opacity: 0.35, scale: 1.25, duration: 1 }, 0)
          // Hold the settled window for a beat before the page moves on.
          timeline.to({}, { duration: 0.3 })

        })

        ScrollTrigger.refresh()
        cleanup = () => mm.revert()
      })
      .catch(() => {
        // Without GSAP the copy and the video simply stack.
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [reduce])

  return (
    <section className="hero" id="top">
      <div className="hero__track" ref={trackRef}>
        <div className="hero__stage">
          <div className="hero__glow" aria-hidden="true" />

          <div className="ma-container hero__copy">
            <p className="hero__eyebrow">
              <span className="eyebrow__dot" aria-hidden="true" />
              {hero.eyebrow}
            </p>
            <h1 className="hero__title">
              <span className="hero__title-main">{hero.title}</span>
              <HeroRotator phrases={hero.rotator} />
            </h1>
            <div className="hero__ctas">
              <Button href="#booking" variant="primary" size="lg">
                {hero.primary}
                <ArrowRight className="btn-arrow icon-inline" size={20} aria-hidden="true" />
              </Button>
            </div>
            <p className="hero__note">
              <Clock3 aria-hidden="true" />
              {hero.note}
            </p>
          </div>

          {/* The headline that takes over once the window has expanded. */}
          <div className="hero__swap" id="video">
            <span className="hero-video__kicker">
              <span className="eyebrow__dot" aria-hidden="true" />
              {video.kicker}
            </span>
            <h2 className="hero-video__title">{video.title}</h2>
          </div>

          <div className="hero__window">
            <HeroVideoFrame activate={activate} />
          </div>

          <div className="ma-container hero__speakers">
            <HeroVideoSpeakers />
          </div>
        </div>
      </div>
    </section>
  )
}
