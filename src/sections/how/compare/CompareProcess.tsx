import { Check, Clock, Gauge, HeartHandshake, Hammer, RotateCcw, SlidersHorizontal, Users, Wallet, X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Mark, MarkerText } from '@/components/kokonutui/marker-text'
import { how } from '../../../content/ar'
import { useInViewAutoplay } from '../../../motion/useInViewAutoplay'
import { scenes } from './registry'

const icons = [Clock, SlidersHorizontal, Hammer, Users, RotateCcw, Gauge, HeartHandshake, Wallet] as const
/** A real click inside a scene holds the step this long before it moves on. */
const HOLD_MS = 9000

/**
 * «مع ماستري مقابل التقليدي» as a process: one dimension at a time, the old
 * way struck through, the Mastery way underlined, then a live scene that
 * proves it. Plays only on screen, loops, and replays the current step when
 * scrolled back to.
 */
export function CompareProcess() {
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.35 })
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const [run, setRun] = useState(0)
  const [held, setHeld] = useState(false)
  const holdTimer = useRef(0)

  // Coming back into view replays the scene from its start.
  const wasPaused = useRef(paused)
  useEffect(() => {
    if (wasPaused.current && !paused) setRun((r) => r + 1)
    wasPaused.current = paused
  }, [paused])

  // Advance when the scene has had its time (not while held or off screen).
  const sceneMs = scenes[step].ms
  useEffect(() => {
    if (paused || held || reduce) return
    const id = window.setTimeout(() => {
      setStep((s) => (s + 1) % scenes.length)
      setRun((r) => r + 1)
    }, sceneMs)
    return () => window.clearTimeout(id)
  }, [step, run, paused, held, reduce, sceneMs])

  const goTo = (index: number) => {
    setHeld(false)
    setStep(index)
    setRun((r) => r + 1)
  }

  const hold = useCallback(() => {
    setHeld(true)
    window.clearTimeout(holdTimer.current)
    holdTimer.current = window.setTimeout(() => setHeld(false), HOLD_MS)
  }, [])
  useEffect(() => () => window.clearTimeout(holdTimer.current), [])

  // Phones: keep the active chip in view inside the scrolling rail.
  const railRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const rail = railRef.current
    const item = rail?.children[step] as HTMLElement | undefined
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return
    rail.scrollTo({ left: item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2, behavior: 'smooth' })
  }, [step])

  const [label, traditional, mastery] = how.compare[step]
  const { Scene } = scenes[step]
  const runKey = `${step}-${run}`

  return (
    <div className="cmp" ref={ref}>
      <div className="cmp-rail" role="tablist" aria-label="أبعاد المقارنة" ref={railRef}>
        {how.compare.map(([dim], index) => {
          const Icon = icons[index] ?? Clock
          const active = index === step
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="cmp-stage"
              className={active ? 'cmp-rail__item is-active' : 'cmp-rail__item'}
              key={dim}
              onClick={() => goTo(index)}
            >
              {active ? (
                <motion.span
                  layoutId="cmp-rail-glider"
                  className="cmp-rail__glider"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  aria-hidden="true"
                >
                  {!reduce ? (
                    <span
                      className="cmp-rail__timer"
                      key={runKey}
                      style={{ animationDuration: `${sceneMs}ms`, animationPlayState: paused || held ? 'paused' : 'running' }}
                    />
                  ) : null}
                </motion.span>
              ) : null}
              <span className="cmp-rail__icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="cmp-rail__label">{dim}</span>
            </button>
          )
        })}
      </div>

      <div className="focus-glow cmp-stage-wrap">
        <div className="cmp-stage" id="cmp-stage" role="tabpanel" aria-label={label}>
          <MarkerText className="cmp-claim" key={`claim-${runKey}`} show={!paused} gap={180}>
            <p className="cmp-claim__old">
              <X aria-hidden="true" />
              <span className="cmp-claim__tag">التقليدي</span>
              <Mark type="strike" color="color-mix(in srgb, var(--text) 55%, transparent)">
                {traditional}
              </Mark>
            </p>
            <p className="cmp-claim__new">
              <Check aria-hidden="true" />
              <span className="cmp-claim__tag cmp-claim__tag--new">ماستري</span>
              <Mark type="underline" color="var(--coral)">
                {mastery}
              </Mark>
            </p>
          </MarkerText>

          <div className="cmp-stage__scene">
            <Scene key={runKey} onHold={hold} />
          </div>
        </div>
      </div>
    </div>
  )
}
