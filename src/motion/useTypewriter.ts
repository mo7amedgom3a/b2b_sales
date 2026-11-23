import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'

type Options = {
  typeMs?: number
  eraseMs?: number
  holdMs?: number
  startDelayMs?: number
  charsPerTick?: number
  charsPerErase?: number
  loop?: boolean
  paused?: boolean
  /** Change this value to restart from an empty prompt (e.g. the composed path). */
  restartKey?: string | number
  /** Random typing cadence between these two values (ms) for a human rhythm. */
  jitterMs?: readonly [number, number]
  /** Extra pause after Arabic punctuation (ms) — only used with jitter. */
  punctuationHoldMs?: number
}

export type TypewriterPhase = 'typing' | 'holding' | 'erasing' | 'done'

const PUNCTUATION = new Set(['،', ',', '.', '؟', '?', '!', ':', '؛'])

/**
 * Type → hold → erase → next. One character chunk at a time, so it can drive
 * the path builder and any other "AI is writing" moment. With `jitterMs` the
 * cadence becomes organic (and pauses softly after punctuation).
 */
export function useTypewriter(texts: readonly string[], options: Options = {}) {
  const {
    typeMs = 42,
    eraseMs = 18,
    holdMs = 1500,
    startDelayMs = 0,
    charsPerTick = 1,
    charsPerErase = 2,
    loop = true,
    paused = false,
    restartKey = '',
    jitterMs,
    punctuationHoldMs = 180,
  } = options

  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(() => (reduce ? (texts[0] ?? '') : ''))
  const [phase, setPhase] = useState<TypewriterPhase>(reduce ? 'done' : 'typing')

  const current = texts.length > 0 ? texts[index % texts.length] ?? '' : ''
  const chars = Array.from(current)
  const lastChar = Array.from(text).at(-1)

  // Reset when the source changes, when the loop advances, or on explicit restart.
  useEffect(() => {
    setText(reduce ? current : '')
    setPhase(reduce ? 'done' : 'typing')
  }, [current, restartKey, reduce])

  useEffect(() => {
    if (reduce || paused || phase !== 'typing') return

    const typedLength = Array.from(text).length
    let delay = typedLength === 0 ? startDelayMs : typeMs
    if (typedLength > 0 && jitterMs) {
      const [min, max] = jitterMs
      delay = min + Math.random() * Math.max(0, max - min)
      if (lastChar && PUNCTUATION.has(lastChar)) delay += punctuationHoldMs
    }

    const timer = window.setTimeout(() => {
      const next = Array.from(current).slice(0, typedLength + charsPerTick).join('')
      setText(next)
      if (Array.from(next).length >= chars.length) setPhase('holding')
    }, delay)

    return () => window.clearTimeout(timer)
  }, [
    text,
    phase,
    paused,
    reduce,
    current,
    chars.length,
    typeMs,
    charsPerTick,
    startDelayMs,
    jitterMs,
    punctuationHoldMs,
    lastChar,
  ])

  useEffect(() => {
    if (reduce || paused || phase !== 'holding') return
    const timer = window.setTimeout(() => {
      if (!loop && index >= texts.length - 1) {
        setPhase('done')
        return
      }
      setPhase('erasing')
    }, holdMs)
    return () => window.clearTimeout(timer)
  }, [phase, paused, reduce, holdMs, loop, index, texts.length])

  useEffect(() => {
    if (reduce || paused || phase !== 'erasing') return
    const timer = window.setTimeout(() => {
      const currentChars = Array.from(text)
      if (currentChars.length <= charsPerErase) {
        setText('')
        if (loop) {
          setIndex((value) => value + 1)
        } else {
          setPhase('typing')
        }
        return
      }
      setText(currentChars.slice(0, currentChars.length - charsPerErase).join(''))
    }, eraseMs)
    return () => window.clearTimeout(timer)
  }, [phase, paused, reduce, eraseMs, text, charsPerErase, loop])

  return { text, phase, index, target: current }
}

/** Track characters that just left the prompt so they can animate out smoothly. */
export function useExitGhosts(text: string) {
  const [ghosts, setGhosts] = useState<{ char: string; key: number }[]>([])
  const prevRef = useRef<string[]>([])
  const nextKey = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const chars = Array.from(text)
    const prev = prevRef.current
    prevRef.current = chars
    if (chars.length >= prev.length) return

    const removed = prev.slice(chars.length).map((char) => ({ char, key: nextKey.current++ }))
    setGhosts((current) => [...current, ...removed].slice(-8))
    timers.current.push(
      window.setTimeout(() => {
        setGhosts((current) => current.filter((ghost) => !removed.includes(ghost)))
      }, 190),
    )
  }, [text])

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer))
    },
    [],
  )

  return ghosts
}
