import { useCallback, useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useExitGhosts, useTypewriter } from './useTypewriter'

export type DemoPhase = 'typing' | 'working' | 'showing' | 'clearing'

type Options = {
  /** Pause timers (off-screen, hovered, hidden tab). */
  paused?: boolean
  /** Advance to the next prompt on its own. */
  autoplay?: boolean
  /** "Analysing…" skeleton between the typed prompt and the result. */
  workingMs?: number
  /** How long the finished result stays before the next prompt. */
  showMs?: number
  /** Gap after the result leaves and before the next prompt starts typing. */
  clearMs?: number
  typeMs?: number
  jitterMs?: readonly [number, number]
  /** Called after the last prompt's result has been shown (one full cycle). */
  onCycle?: () => void
  /**
   * Classbase-style scenes: when the demo comes back into view (paused → playing),
   * replay the current scene from its first frame instead of resuming mid-way.
   */
  replayOnEnter?: boolean
}

/**
 * One clock for every "type a question → get the answer" demo: the step
 * index, the typed prompt and the result visibility all live here, so the
 * result on screen always belongs to the prompt that was just typed.
 *
 * typing → working → showing → (next step) typing …
 */
export function useDemoSequence(prompts: readonly string[], options: Options = {}) {
  const {
    paused = false,
    autoplay = true,
    workingMs = 800,
    showMs = 4200,
    clearMs = 420,
    typeMs = 52,
    jitterMs = [38, 78],
    onCycle,
    replayOnEnter = true,
  } = options

  const onCycleRef = useRef(onCycle)
  useEffect(() => {
    onCycleRef.current = onCycle
  }, [onCycle])

  const reduce = useReducedMotion() ?? false
  const [step, setStep] = useState(0)
  const [run, setRun] = useState(0)
  const [phase, setPhase] = useState<DemoPhase>(reduce ? 'showing' : 'typing')

  const prompt = prompts[step % Math.max(1, prompts.length)] ?? ''
  const { text, phase: typePhase } = useTypewriter([prompt], {
    loop: false,
    paused,
    restartKey: `${step}-${run}`,
    holdMs: 60_000,
    typeMs,
    jitterMs,
  })
  const ghosts = useExitGhosts(text)

  // Typed → analysing.
  useEffect(() => {
    if (reduce || paused || phase !== 'typing') return
    if (typePhase !== 'holding' || text !== prompt) return
    const timer = window.setTimeout(() => setPhase('working'), 240)
    return () => window.clearTimeout(timer)
  }, [reduce, paused, phase, typePhase, text, prompt])

  // Analysing → result.
  useEffect(() => {
    if (reduce || paused || phase !== 'working') return
    const timer = window.setTimeout(() => setPhase('showing'), workingMs)
    return () => window.clearTimeout(timer)
  }, [reduce, paused, phase, workingMs])

  // Result → clearing (the answer animates out while the old prompt stays).
  useEffect(() => {
    if (reduce || paused || !autoplay || phase !== 'showing' || prompts.length === 0) return
    const timer = window.setTimeout(() => setPhase('clearing'), showMs)
    return () => window.clearTimeout(timer)
  }, [reduce, paused, autoplay, phase, showMs, prompts.length])

  // Clearing → next prompt (a single prompt simply replays).
  useEffect(() => {
    if (reduce || paused || phase !== 'clearing') return
    const timer = window.setTimeout(() => {
      if (step >= prompts.length - 1) onCycleRef.current?.()
      setStep((value) => (value + 1) % Math.max(1, prompts.length))
      setRun((value) => value + 1)
      setPhase('typing')
    }, clearMs)
    return () => window.clearTimeout(timer)
  }, [reduce, paused, phase, clearMs, prompts.length, step])

  useEffect(() => {
    if (reduce) setPhase('showing')
  }, [reduce])

  /** Jump to a step (pill/chip click) and replay its prompt from scratch. */
  const goTo = useCallback(
    (index: number) => {
      setStep(index)
      setRun((value) => value + 1)
      setPhase(reduce ? 'showing' : 'typing')
    },
    [reduce],
  )

  // Re-entering the viewport replays the current scene from the start.
  const wasPaused = useRef(paused)
  useEffect(() => {
    const resumed = wasPaused.current && !paused
    wasPaused.current = paused
    if (resumed && replayOnEnter && !reduce) {
      setRun((value) => value + 1)
      setPhase('typing')
    }
  }, [paused, replayOnEnter, reduce])

  return {
    step,
    prompt,
    phase,
    text: reduce ? prompt : text,
    typePhase,
    ghosts,
    goTo,
    /** True only once the typed prompt has been "answered". */
    resultVisible: phase === 'showing',
    /** 0…1 through the whole cycle — drives progress bars. */
    progress:
      prompts.length === 0
        ? 1
        : (step + (phase === 'showing' || phase === 'clearing' ? 1 : phase === 'working' ? 0.7 : 0.35)) / prompts.length,
    /** Changes every time a result is (re)shown — use as a React key. */
    resultKey: `${step}-${run}`,
  }
}
