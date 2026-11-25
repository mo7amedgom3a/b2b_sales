import { Fragment, useEffect, useRef, useState } from 'react'
import { ArrowUpLeft } from 'lucide-react'
import { video } from '../../content/ar'
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
 * The video window inside the hero. The poster paints with the page; the
 * YouTube player (controls, unmute, fullscreen) mounts once `activate` turns
 * true, autoplays muted on loop while visible and pauses when scrolled away.
 */
export function HeroVideoFrame({ activate }: { activate: boolean }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const node = frameRef.current
    const frame = iframeRef.current
    if (!node || !frame || !loaded || typeof IntersectionObserver === 'undefined') return
    const command = (func: 'playVideo' | 'pauseVideo') =>
      frame.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args: [] }), '*')
    const observer = new IntersectionObserver(
      (entries) => command(entries[0]?.isIntersecting ? 'playVideo' : 'pauseVideo'),
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loaded])

  return (
    <div className="hero-video__frame" ref={frameRef}>
      <div className="hero-video__media">
        <img
          className="hero-video__poster"
          src={video.poster}
          alt="مشهد من الفيديو التعريفي لماستري"
          width="960"
          height="540"
          fetchPriority="low"
        />
        {activate && video.youtubeId ? (
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
  )
}

/** «مع د. … و د. …»: the two speakers, linked to their profiles. */
export function HeroVideoSpeakers({ activate }: { activate: boolean }) {
  const [speakers, setSpeakers] = useState<TrainerCard[]>(() => pickSpeakers(mergeTrainers([])))

  // Swap the initials for real photos once the expert data arrives (shared, cached request).
  useEffect(() => {
    if (!activate) return
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
  }, [activate])

  return (
    <div className="hero-video__speakers">
      {speakers.length > 0 ? (
        <>
          <span className="hero-video__speakers-label">مع</span>
          {speakers.map((person, index) => (
            <Fragment key={person.name}>
              {index > 0 ? (
                <span className="hero-video__speakers-sep" aria-hidden="true">
                  و
                </span>
              ) : null}
              <a
                className="hero-video__speaker"
                href={person.profile}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`الملف الشخصي لـ${person.name} على منصة ماستري — يفتح في تبويب جديد`}
              >
                <Avatar initial={person.initial} tone={person.tone} size={36} photo={person.photo} alt="" />
                <span className="hero-video__speaker-text">
                  <span className="hero-video__speaker-name">
                    {person.name}
                    <ArrowUpLeft aria-hidden="true" />
                  </span>
                  <span className="hero-video__speaker-title">{person.title ?? person.role}</span>
                </span>
              </a>
            </Fragment>
          ))}
        </>
      ) : (
        <span>
          مع <b>{video.speakers[0]}</b> و<b>{video.speakers[1]}</b>
        </span>
      )}
    </div>
  )
}
