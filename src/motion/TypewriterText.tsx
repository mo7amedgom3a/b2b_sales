import type { CSSProperties } from 'react'
import { cn } from '../lib/cx'
import { useExitGhosts, useTypewriter } from './useTypewriter'
import type { TypewriterPhase } from './useTypewriter'

type Ghost = { char: string; key: number }

/** The visible characters: typed ones rise in, erased ones fade up out of the line. */
export function TypewriterChars({
  text,
  ghosts = [],
  caret = true,
  phase,
  className,
  style,
}: {
  text: string
  ghosts?: Ghost[]
  caret?: boolean
  phase?: TypewriterPhase
  className?: string
  style?: CSSProperties
}) {
  const chars = Array.from(text)
  return (
    <span className={cn('tw', className)} style={style} aria-hidden="true">
      {chars.map((char, index) => (
        <span className="tw-char" key={index}>
          {char === ' ' ? '\u00a0' : char}
        </span>
      ))}
      {ghosts.map((ghost) => (
        <span className="tw-char tw-char--out" key={`g${ghost.key}`}>
          {ghost.char === ' ' ? '\u00a0' : ghost.char}
        </span>
      ))}
      {caret && phase !== 'done' ? (
        <span className={cn('tw-caret', phase === 'typing' && 'is-typing')} />
      ) : null}
    </span>
  )
}

type TypewriterTextProps = {
  texts: readonly string[]
  className?: string
  /** Blinking caret after the last typed character. */
  caret?: boolean
  loop?: boolean
  paused?: boolean
  restartKey?: string | number
  typeMs?: number
  eraseMs?: number
  holdMs?: number
  charsPerTick?: number
  charsPerErase?: number
  jitterMs?: readonly [number, number]
  punctuationHoldMs?: number
  style?: CSSProperties
  /** Announce the finished text politely (screen readers). */
  live?: boolean
}

/**
 * Smooth typewriter: characters rise + de-blur in as they are typed, and the
 * erased tail fades up out of the line instead of snapping away.
 */
export function TypewriterText({
  texts,
  className,
  caret = true,
  loop = true,
  paused = false,
  restartKey = '',
  typeMs,
  eraseMs,
  holdMs,
  charsPerTick,
  charsPerErase,
  jitterMs,
  punctuationHoldMs,
  style,
  live = true,
}: TypewriterTextProps) {
  const { text, phase, target } = useTypewriter(texts, {
    typeMs,
    eraseMs,
    holdMs,
    charsPerTick,
    charsPerErase,
    loop,
    paused,
    restartKey,
    jitterMs,
    punctuationHoldMs,
  })
  const ghosts = useExitGhosts(text)

  return (
    <span className={cn('tw', className)} style={style}>
      <TypewriterChars text={text} ghosts={ghosts} caret={caret} phase={phase} />
      {live && (phase === 'holding' || phase === 'done') ? (
        <span className="sr-only" aria-live="polite">
          {target}
        </span>
      ) : null}
    </span>
  )
}
