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
import { useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { how } from '../content/ar'
import { useCardStack } from '../motion/useCardStack'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'
import { HowOrbit } from './how/HowOrbit'

const deliveryIcons = { clock: Clock, live: Radio, spark: Sparkles } as const
const compareIcons = [Clock, SlidersHorizontal, Hammer, Users, RotateCcw, Gauge, HeartHandshake, Wallet] as const

type Side = 'mastery' | 'old'

export function HowWeWork() {
  const [side, setSide] = useState<Side>('mastery')
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

          {/* Phones: pick a side, then read one compact list (no side-by-side squeeze). */}
          <div className="compare__mobile">
            <ToggleGroup
              type="single"
              value={side}
              onValueChange={(value) => value && setSide(value as Side)}
              className="compare-switch"
              aria-label="اختر نوع التدريب للمقارنة"
            >
              <ToggleGroupItem value="mastery" showCheck={false} className="compare-switch__item">
                <Check aria-hidden="true" /> مع ماستري
              </ToggleGroupItem>
              <ToggleGroupItem value="old" showCheck={false} className="compare-switch__item">
                <X aria-hidden="true" /> التدريب التقليدي
              </ToggleGroupItem>
            </ToggleGroup>

            <div className={side === 'mastery' ? 'focus-glow' : undefined}>
            <ul
              className={`compare-list compare-list--${side}`}
              key={side}
              aria-label={side === 'mastery' ? 'التدريب مع ماستري' : 'التدريب التقليدي'}
            >
              {how.compare.map(([label, traditional, mastery], index) => {
                const Icon = compareIcons[index] ?? Clock
                const Mark = side === 'mastery' ? Check : X
                return (
                  <li className="compare-list__row" key={label} style={{ animationDelay: `${index * 35}ms` }}>
                    <span className="compare-list__dim">
                      <Icon aria-hidden="true" />
                      {label}
                    </span>
                    <span className="compare-list__value">
                      <Mark className="compare-list__mark" aria-hidden="true" />
                      {side === 'mastery' ? mastery : traditional}
                    </span>
                  </li>
                )
              })}
            </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
