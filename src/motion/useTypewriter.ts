import { useEffect, useState } from 'react'
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
}

export type TypewriterPhase = 'typing' | 'holding' | 'erasing' | 'done'

/**
 * Type → hold → erase → next. One character chunk at a time, so it can drive
 * the path builder and any other "AI is writing" moment.
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
  } = options

  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(() => (reduce ? (texts[0] ?? '') : ''))
  const [phase, setPhase] = useState<TypewriterPhase>(reduce ? 'done' : 'typing')

  const current = texts.length > 0 ? texts[index % texts.length] ?? '' : ''
  const chars = Array.from(current)

  // Reset when the source changes, when the loop advances, or on explicit restart.
  useEffect(() => {
    setText(reduce ? current : '')
    setPhase(reduce ? 'done' : 'typing')
  }, [current, restartKey, reduce])

  useEffect(() => {
    if (reduce || paused || phase !== 'typing') return
    const delay = text.length === 0 ? startDelayMs : typeMs

    const timer = window.setTimeout(() => {
      const next = Array.from(current).slice(0, Array.from(text).length + charsPerTick).join('')
      setText(next)
      if (Array.from(next).length >= chars.length) setPhase('holding')
    }, delay)

    return () => window.clearTimeout(timer)
  }, [text, phase, paused, reduce, current, chars.length, typeMs, charsPerTick, startDelayMs])

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

  return { text, phase, index }
}
