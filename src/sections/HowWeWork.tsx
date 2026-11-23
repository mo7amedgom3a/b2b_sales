import {
  Check,
  Clock,
  Gauge,
  Hammer,
  HeartHandshake,
  PenTool,
  Radio,
  RotateCcw,
  Rocket,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { how } from '../content/ar'
import { useCardStack } from '../motion/useCardStack'
import { useHorizontalPan } from '../motion/useHorizontalPan'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'

const stepIcons = [Stethoscope, PenTool, Rocket, TrendingUp] as const
const deliveryIcons = { clock: Clock, live: Radio, spark: Sparkles } as const
const compareIcons = [Clock, SlidersHorizontal, Hammer, Users, RotateCcw, Gauge, HeartHandshake, Wallet] as const

export function HowWeWork() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 40%'] })
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })
  const stepsRef = useCardStack<HTMLDivElement>({ breakpoint: 767 })
  const deliveryRef = useCardStack<HTMLDivElement>({ breakpoint: 767 })
  const compareRef = useHorizontalPan<HTMLDivElement>({ breakpoint: 899 })

  return (
    <section className="section how" id="how">
      <div className="ma-container">
        <SecHead index="04" title={how.title} lead={how.lead} />

        <div ref={ref}>
          <div className="how__progress" aria-hidden="true">
            <motion.span style={{ scaleX: reduce ? 1 : scaleX }} />
          </div>

          <div className="how__steps stack" ref={stepsRef}>
            {how.steps.map((step, index) => {
              const Icon = stepIcons[index] ?? Stethoscope
              return (
                <div className="stack__item" key={step.num}>
                  <Reveal className="stack__card" delay={Number(step.num) * 0.04}>
                    <div className="how-step">
                      <span className="how-step__icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <div className="how-step__num">{step.num}</div>
                      <h3 className="how-step__title">{step.title}</h3>
                      <p className="how-step__body">{step.body}</p>
                      <p className="how-step__out">
                        <Check aria-hidden="true" />
                        <span>
                          <b>المخرج:</b> {step.output}
                        </span>
                      </p>
                    </div>
                  </Reveal>
                </div>
              )
            })}
          </div>
        </div>

        <div className="delivery">
          <div className="delivery__head">
            <h3>{how.deliveryTitle}</h3>
          </div>
          <div className="delivery__grid stack" ref={deliveryRef}>
            {how.delivery.map((item, index) => {
              const Icon = deliveryIcons[item.icon]
              return (
                <div className="stack__item" key={item.title}>
                  <Reveal className="stack__card" delay={index * 0.05}>
                    <article className="delivery-card">
                      <span className="delivery-card__icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <h4>{item.title}</h4>
                      <p>{item.body}</p>
                    </article>
                  </Reveal>
                </div>
              )
            })}
          </div>
        </div>

        <div className="compare">
          <div className="compare__head">
            <h3>{how.compareTitle}</h3>
          </div>

          <table className="compare__table">
            <thead>
              <tr>
                <th scope="col">البُعد</th>
                <th scope="col">التدريب التقليدي</th>
                <th scope="col">مع ماستري</th>
              </tr>
            </thead>
            <tbody>
              {how.compare.map(([label, traditional, mastery]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{traditional}</td>
                  <td>{mastery}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            className="compare__mobile h-pan"
            ref={compareRef}
            role="group"
            aria-label="مقارنة التدريب التقليدي مع ماستري — مرّر للأسفل للتنقل"
          >
            <div className="h-pan__track">
              {how.compare.map(([label, traditional, mastery], index) => {
                const Icon = compareIcons[index] ?? Clock
                return (
                  <div className="h-pan__panel" key={label}>
                    <div className="compare-card">
                      <h4>
                        <span className="compare-card__dim">
                          <Icon aria-hidden="true" />
                          {label}
                        </span>
                      </h4>
                      <div className="compare-card__row">
                        <span>
                          <X aria-hidden="true" /> التقليدي
                        </span>
                        <p>{traditional}</p>
                      </div>
                      <div className="compare-card__row">
                        <span>
                          <Check aria-hidden="true" /> مع ماستري
                        </span>
                        <p>{mastery}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="h-pan__progress" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  )
}
