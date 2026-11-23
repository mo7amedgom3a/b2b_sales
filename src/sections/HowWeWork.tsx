import {
  Check,
  Clock,
  Columns3,
  Gauge,
  Hammer,
  HeartHandshake,
  Radio,
  RotateCcw,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  Wallet,
  Workflow,
  X,
} from 'lucide-react'
import { how } from '../content/ar'
import { useCardStack } from '../motion/useCardStack'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'
import { HowOrbit } from './how/HowOrbit'

const deliveryIcons = { clock: Clock, live: Radio, spark: Sparkles } as const
const compareIcons = [Clock, SlidersHorizontal, Hammer, Users, RotateCcw, Gauge, HeartHandshake, Wallet] as const

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

          <table className="compare__table">
            <thead>
              <tr>
                <th scope="col">
                  <Columns3 aria-hidden="true" /> البُعد
                </th>
                <th scope="col">
                  <X aria-hidden="true" /> التدريب التقليدي
                </th>
                <th scope="col" className="compare__mastery">
                  <Check aria-hidden="true" /> مع ماستري
                </th>
              </tr>
            </thead>
            <tbody>
              {how.compare.map(([label, traditional, mastery], index) => {
                const Icon = compareIcons[index] ?? Clock
                return (
                  <tr key={label}>
                    <td>
                      <span className="compare__dim">
                        <Icon aria-hidden="true" />
                        {label}
                      </span>
                    </td>
                    <td>
                      <span className="compare__cell compare__cell--old">
                        <X aria-hidden="true" />
                        {traditional}
                      </span>
                    </td>
                    <td>
                      <span className="compare__cell compare__cell--new">
                        <Check aria-hidden="true" />
                        {mastery}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="compare__mobile" role="list" aria-label="مقارنة التدريب التقليدي مع ماستري">
              {how.compare.map(([label, traditional, mastery], index) => {
                const Icon = compareIcons[index] ?? Clock
                return (
                  <div role="listitem" key={label}>
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
        </div>
      </div>
    </section>
  )
}
