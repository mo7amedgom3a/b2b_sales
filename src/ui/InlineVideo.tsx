import { Play } from 'lucide-react'
import type { ReactNode } from 'react'

export function youtubeEmbedSrc(id: string, options: { start?: number; muted?: boolean; loop?: boolean } = {}) {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    playsinline: '1',
    modestbranding: '1',
    enablejsapi: '1',
  })
  if (options.muted) params.set('mute', '1')
  if (options.loop) {
    params.set('loop', '1')
    params.set('playlist', id)
  }
  if (options.start) params.set('start', String(options.start))
  return `https://www.youtube-nocookie.com/embed/${id}?${params}`
}

type InlineVideoProps = {
  youtubeId: string | null | undefined
  title: string
  poster: string
  posterAlt: string
  /** Controlled: true swaps the poster for the playing video, in place (no popup). */
  playing: boolean
  onPlay: () => void
  start?: number
  className?: string
  /** Label inside the play button over the poster. */
  label?: ReactNode
  /** Shown instead of the player when there is no video id yet. */
  fallback?: ReactNode
}

/**
 * Poster → in-place YouTube player. Clicking play replaces the cover image with
 * the embed inside the same frame and starts it with sound.
 */
export function InlineVideo({
  youtubeId,
  title,
  poster,
  posterAlt,
  playing,
  onPlay,
  start,
  className,
  label,
  fallback,
}: InlineVideoProps) {
  if (playing) {
    return (
      <div className={className ? `inline-video is-playing ${className}` : 'inline-video is-playing'}>
        {youtubeId ? (
          <iframe
            src={youtubeEmbedSrc(youtubeId, { start })}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="inline-video__fallback">{fallback}</div>
        )}
      </div>
    )
  }

  return (
    <div className={className ? `inline-video ${className}` : 'inline-video'}>
      <img src={poster} alt={posterAlt} loading="lazy" width="640" height="400" />
      <button className="story-video__play" type="button" onClick={onPlay}>
        <span className="circle" aria-hidden="true">
          <Play aria-hidden="true" />
        </span>
        {label}
      </button>
    </div>
  )
}
