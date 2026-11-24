import { useEffect, useRef, useState } from 'react'
import { video } from '../../content/ar'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { loadGsap, MQ } from '../../motion/gsap'
import { fetchExperts } from '../../lib/api'
import { mergeTrainers } from '../../lib/experts'
import type { TrainerCard } from '../../lib/experts'
import { Avatar } from '../../ui/Avatar'
import { youtubeEmbedSrc } from '../../ui/InlineVideo'

function pickSpeakers(people: TrainerCard[]) {
  return video.speakers
    .map((name) => people.find((person) => person.name === name))
    .filter((person): person is TrainerCard => Boolean(person))
}

/**
 * «ثلاث دقائق مع خبراء ماستري» inside the hero.
 *
 * A tall scroll track holds a sticky stage (title + video frame).
 * The frame has a fixed width/height; while the visitor scrolls, GSAP scrubs
 * only its transform so it rises from the bottom, enlarged, and settles fully
 * in view at its real size. The frame is the regular YouTube player (controls,
 * unmute, fullscreen): it autoplays muted on loop while visible and pauses
 * whenever the stage is scrolled away.
 */
export function HeroVideo() {
  const reduce = usePrefersReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [near, setNear] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [speakers, setSpeakers] = useState<TrainerCard[]>(() => pickSpeakers(mergeTrainers([])))

  // Swap the initials for real photos once the expert data arrives (shared, cached request).
  useEffect(() => {
    if (!near) return
    let cancelled = false
    fetchExperts()
      .then((experts) => {
        if (!cancelled) setSpeakers(pickSpeakers(mergeTrainers(experts)))
      })
      .catch(() => {
        // Keep the initials.
      })
    return () => {
      cancelled = true
    }
  }, [near])

  // Mount the embed (and GSAP) only once the block is about to be seen — keeps the hero LCP lean.
  useEffect(() => {
    const node = trackRef.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // Play while visible, pause when scrolled away.
  useEffect(() => {
    const node = trackRef.current
    const frame = iframeRef.current
    if (!node || !frame || !loaded) return
    const command = (func: 'playVideo' | 'pauseVideo') =>
      frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
    const observer = new IntersectionObserver(
      (entries) => command(entries[0]?.isIntersecting ? 'playVideo' : 'pauseVideo'),
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loaded])

  // Scroll-scrubbed "rise and settle" (jisr.net style): the frame keeps a fixed
  // width/height; only its transform is scrubbed — it starts low and enlarged,
  // peeking from the bottom of the pinned stage, and settles at its real size.
  useEffect(() => {
    const track = trackRef.current
    if (!track || !near || reduce) return
    let cancelled = false
    let cleanup = () => {}

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        const stage = track.querySelector<HTMLElement>('.hero-video__stage')
        const frame = track.querySelector<HTMLElement>('.hero-video__frame')
        const intro = track.querySelector<HTMLElement>('.hero-video__intro')
        if (!stage || !frame) return

        const mm = gsap.matchMedia()
        mm.add({ mobile: MQ.mobile, desktop: '(min-width: 768px)' }, (context) => {
          const { mobile } = context.conditions as { mobile: boolean; desktop: boolean }
          track.classList.add('is-scrubbed')

          const startScale = mobile ? 1.12 : 1.32
          // Start with the frame's top edge at ~70% of the stage height (only the top peeks in).
          const startY = () => stage.clientHeight * (mobile ? 0.62 : 0.68) - frame.offsetTop

          const headerH = () =>
            parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72

          const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: track,
              start: () => `top top+=${headerH()}`,
              end: 'bottom bottom',
              scrub: mobile ? 0.5 : 0.9,
              invalidateOnRefresh: true,
            },
          })

          timeline.fromTo(
            frame,
            { y: startY, scale: startScale, borderRadius: mobile ? 18 : 28 },
            { y: 0, scale: 1, borderRadius: mobile ? 14 : 20, duration: 1, ease: 'power2.out' },
            0,
          )
          if (intro) timeline.fromTo(intro, { y: 24, autoAlpha: 0.35 }, { y: 0, autoAlpha: 1, duration: 0.55 }, 0)
          // Hold the settled frame for a beat before the section scrolls on.
          timeline.to({}, { duration: 0.25 })

          return () => track.classList.remove('is-scrubbed')
        })

        ScrollTrigger.refresh()
        cleanup = () => mm.revert()
      })
      .catch(() => {
        // Without GSAP the frame simply shows at its settled size.
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [near, reduce])

  return (
    <div className="hero-video" id="video">
      <div className="hero-video__track" ref={trackRef}>
        <div className="hero-video__stage">
          <div className="ma-container hero-video__intro">
            <span className="hero-video__kicker">
              <span className="eyebrow__dot" aria-hidden="true" />
              {video.kicker}
            </span>
            <h2 className="hero-video__title">{video.title}</h2>
            <div className="hero-video__speakers">
              <span className="hero-video__speaker-avatars" aria-hidden="true">
                {speakers.map((person) => (
                  <Avatar
                    key={person.name}
                    initial={person.initial}
                    tone={person.tone}
                    size={34}
                    photo={person.photo}
                    alt=""
                  />
                ))}
              </span>
              <span>
                مع <b>{video.speakers[0]}</b> و<b>{video.speakers[1]}</b>
              </span>
            </div>
            
          </div>

          <div className="hero-video__frame">
            <div className="hero-video__media">
              <img
                className="hero-video__poster"
                src={video.poster}
                alt="مشهد من الفيديو التعريفي لماستري"
                loading="lazy"
                width="960"
                height="540"
              />
              {near && video.youtubeId ? (
                <iframe
                  ref={iframeRef}
                  className={loaded ? 'hero-video__embed is-loaded' : 'hero-video__embed'}
                  src={youtubeEmbedSrc(video.youtubeId, { muted: true, loop: true })}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  onLoad={() => setLoaded(true)}
                />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
