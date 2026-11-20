import { Check, Clock, Radio, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { how } from '../content/ar'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'

const icons = {
  clock: Clock,
  live: Radio,
  spark: Sparkles,
} as const

export function HowWeWork() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 40%'] })
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26, restDelta: 0.001 })

  return (
    <section className="section how" id="how">
      <div className="ma-container">
        <SecHead index="04" title={how.title} lead={how.lead} />

        <div ref={ref}>
          <div className="how__progress" aria-hidden="true">
            <motion.span style={{ scaleX: reduce ? 1 : scaleX }} />
          </div>

          <div className="how__steps">
            {how.steps.map((step) => (
              <Reveal className="how-step" key={step.num} delay={Number(step.num) * 0.04}>
                <div className="how-step__num">{step.num}</div>
                <h3 className="how-step__title">{step.title}</h3>
                <p className="how-step__body">{step.body}</p>
                <p className="how-step__out">
                  <Check aria-hidden="true" />
                  <span>
                    <b>المخرج:</b> {step.output}
                  </span>
                </p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="delivery">
          <div className="delivery__head">
            <h3>{how.deliveryTitle}</h3>
          </div>
          <div className="delivery__grid">
            {how.delivery.map((item, index) => {
              const Icon = icons[item.icon]
              return (
                <Reveal className="delivery-card" key={item.title} delay={index * 0.05}>
                  <span className="delivery-card__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <h4>{item.title}</h4>
                  <p>{item.body}</p>
                </Reveal>
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

          <div className="compare__mobile">
            {how.compare.map(([label, traditional, mastery]) => (
              <div className="compare-card" key={label}>
                <h4>{label}</h4>
                <div className="compare-card__row">
                  <span>التقليدي</span>
                  <p>{traditional}</p>
                </div>
                <div className="compare-card__row">
                  <span>مع ماستري</span>
                  <p>{mastery}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
