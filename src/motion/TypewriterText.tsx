import type { CSSProperties } from 'react'
import { cn } from '../lib/cx'
import { useExitGhosts, useTypewriter } from './useTypewriter'
import type { TypewriterPhase } from './useTypewriter'

type Ghost = { char: string; key: number }

/** Zero-width joiner: keeps an erased Arabic letter in its connected shape while it fades out. */
const ZWJ = '\u200D'

/**
 * The visible text. It is ONE text node, so the browser shapes Arabic as a
 * connected word in every engine (per-letter spans can break cursive joining).
 * Smoothness comes from a soft fade on the writing edge while typing
 * (`.tw-text.is-writing`), and erased letters fade up out of the line.
 */
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
  // Newest ghost = the letter removed last = logically first after the text.
  const orderedGhosts = [...ghosts].reverse()
  return (
    <span className={cn('tw', className)} style={style} aria-hidden="true">
      {text ? <span className={cn('tw-text', phase === 'typing' && 'is-writing')}>{text}</span> : null}
      {orderedGhosts.map((ghost) => (
        <span className="tw-char tw-char--out" key={`g${ghost.key}`}>
          {/\s/.test(ghost.char) ? ghost.char : `${ZWJ}${ghost.char}`}
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
 * Smooth typewriter: the writing edge fades in softly as characters are typed,
 * and the erased tail fades up out of the line instead of snapping away.
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
