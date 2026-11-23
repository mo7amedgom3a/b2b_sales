import {
  ArrowLeft,
  ArrowUpLeft,
  CalendarCheck,
  Check,
  Clock3,
  PenTool,
  Rocket,
  Stethoscope,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { how } from '../../content/ar'
import { useInViewAutoplay } from '../../motion/useInViewAutoplay'

const stepIcons = [Stethoscope, PenTool, Rocket, TrendingUp] as const

/** Node centres in % of the orbit box — clockwise from top-right (RTL reading start). */
const positions = [
  { x: 80, y: 20 },
  { x: 80, y: 80 },
  { x: 20, y: 80 },
  { x: 20, y: 20 },
] as const

const ROTATE_MS = 5200

/** Curved connector from the hub (50,50) to a node, bending horizontally first. */
function connector(x: number, y: number) {
  const cx = 50 + (x - 50) * 0.85
  return `M 50 50 C ${cx} 50, ${x} ${50 + (y - 50) * 0.25}, ${x} ${y}`
}

/**
 * «من التشخيص إلى الأثر» as a radial graph: the Mastery mark at the centre,
 * the four steps orbiting it, and a preview card listing what each step
 * delivers. The active step rotates on its own; a click jumps to a step and
 * the rotation simply carries on from there.
 */
export function HowOrbit() {
  const reduce = useReducedMotion()
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.3 })
  const [active, setActive] = useState(0)
  const steps = how.steps

  useEffect(() => {
    if (reduce || paused) return
    const timer = window.setTimeout(() => setActive((value) => (value + 1) % steps.length), ROTATE_MS)
    return () => window.clearTimeout(timer)
  }, [active, paused, reduce, steps.length])

  const step = steps[active] ?? steps[0]
  const StepIcon = stepIcons[active] ?? Stethoscope

  return (
    <div className="orbit-wrap" ref={ref}>
      <div className="orbit" role="tablist" aria-label="خطوات العمل مع ماستري">
        <svg className="orbit__lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {positions.map((pos, index) => (
            <path
              key={index}
              d={connector(pos.x, pos.y)}
              className={index === active ? 'orbit__line is-active' : 'orbit__line'}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        <div className="orbit__hub" aria-hidden="true">
          <span className="orbit__ring orbit__ring--dashed" />
          <span className="orbit__ring orbit__ring--solid" />
          <span className="orbit__pulse" key={active} />
          <span className="orbit__core">
            <svg className="orbit__mark">
              <use href="#ma-mark" />
            </svg>
          </span>
        </div>

        {steps.map((item, index) => {
          const Icon = stepIcons[index] ?? Stethoscope
          const pos = positions[index] ?? positions[0]
          const isActive = index === active
          return (
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="orbit-preview"
              key={item.num}
              className={isActive ? 'orbit-node is-active' : 'orbit-node'}
              style={{ '--x': pos.x, '--y': pos.y } as CSSProperties}
              onClick={() => setActive(index)}
            >
              <span className="orbit-node__badge" aria-hidden="true">
                <ArrowUpLeft />
              </span>
              <span className="orbit-node__head">
                <Icon className="orbit-node__icon" aria-hidden="true" />
                <span className="orbit-node__num">{item.num}</span>
              </span>
              <span className="orbit-node__title">{item.title}</span>
              <span className="orbit-node__label">{item.label}</span>
              <span className="orbit-node__meta">{item.meta}</span>
            </button>
          )
        })}
      </div>

      <div className="orbit-preview" id="orbit-preview" role="tabpanel" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            className="orbit-preview__grid"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="orbit-preview__head">
              <span className="orbit-preview__icon">
                <StepIcon aria-hidden="true" />
              </span>
              <div>
                <h3 className="orbit-preview__title">{step.title}</h3>
                <span className="orbit-preview__label">{step.label}</span>
              </div>
              <div className="orbit-preview__meta">
                <span>
                  <Clock3 aria-hidden="true" /> {step.meta}
                </span>
                <span>الخطوة {step.num}</span>
              </div>
            </div>

            <ul className="orbit-preview__features">
              {step.features.map(([name, tagline], index) => (
                <motion.li
                  key={name}
                  initial={reduce ? false : { opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + index * 0.07, duration: 0.3 }}
                >
                  <ArrowLeft aria-hidden="true" />
                  <b>{name}</b>
                  <span aria-hidden="true">•</span>
                  <span>{tagline}</span>
                </motion.li>
              ))}
              <li className="orbit-preview__output">
                <Check aria-hidden="true" />
                <span>
                  <b>المخرج:</b> {step.output}
                </span>
              </li>
            </ul>

            <a className="orbit-preview__cta" href="#booking">
              <CalendarCheck aria-hidden="true" />
              ابدأ بالتشخيص
              <ArrowLeft aria-hidden="true" />
            </a>
          </motion.div>
        </AnimatePresence>

        {!reduce ? (
          <span
            className="orbit-preview__timer"
            key={`${active}-${paused}`}
            style={{ animationDuration: `${ROTATE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  )
}
