import { useEffect, useState } from 'react'

type AvatarProps = {
  initial: string
  tone?: string
  size?: number
  photo?: string
  alt?: string
}

const toneMap: Record<string, string> = {
  coral: 'var(--coral)',
  yellow: 'var(--yellow)',
  purple: 'var(--purple)',
  sky: 'var(--sky)',
  pink: 'var(--pink)',
  teal: 'var(--teal)',
  lilac: 'var(--lilac)',
  green: 'var(--green)',
  cream: 'var(--cream)',
}

export function Avatar({ initial, tone = 'yellow', size = 40, photo, alt }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const background = toneMap[tone] ?? 'var(--yellow)'

  useEffect(() => {
    setFailed(false)
  }, [photo])

  const showPhoto = Boolean(photo) && !failed

  return (
    <span
      className="ma-avatar"
      style={{ width: size, height: size, background, fontSize: Math.max(12, Math.round(size * 0.36)) }}
      aria-hidden={showPhoto ? undefined : true}
    >
      {showPhoto ? (
        <img
          src={photo}
          alt={alt ?? ''}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initial
      )}
    </span>
  )
}
