import { Clock, Radio, Scale, Sparkles, Truck, Workflow } from 'lucide-react'
import { how } from '../content/ar'
import { useCardStack } from '../motion/useCardStack'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'
import { HowOrbit } from './how/HowOrbit'
import { CompareProcess } from './how/compare/CompareProcess'

const deliveryIcons = { clock: Clock, live: Radio, spark: Sparkles } as const
export function HowWeWork() {
  const deliveryRef = useCardStack<HTMLDivElement>({ breakpoint: 767 })

  return (
    <section className="section how" id="how">
      <div className="ma-container">
        <SecHead index="04" title={how.title} lead={how.lead} icon={Workflow} />

        <HowOrbit />

        <div className="delivery">
          <div className="delivery__head">
            <h3>
              <Truck aria-hidden="true" />
              {how.deliveryTitle}
            </h3>
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
            <h3>
              <Scale aria-hidden="true" />
              {how.compareTitle}
            </h3>
          </div>

          <CompareProcess />
        </div>
      </div>
    </section>
  )
}
