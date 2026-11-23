import { Hourglass, Percent, PhoneMissed, Shuffle } from 'lucide-react'
import { problem } from '../content/ar'
import { useCardStack } from '../motion/useCardStack'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const cardIcons = [Percent, PhoneMissed, Shuffle, Hourglass] as const

export function Problem() {
  const stackRef = useCardStack<HTMLDivElement>({ breakpoint: 767, peek: 10, step: 300 })

  return (
    <section className="section section--band problem" id="problem">
      <div className="ma-container">
        <SecHead index="03" title={problem.title} lead={problem.body} />

        <div className="problem__layout">
          <Reveal className="problem__visual">
            <div className="problem__visual-inner">
              <Tag tone="coral">من الميدان</Tag>
              <img
                src="/assets/hero/hero-sales-team.webp"
                alt="فريق مبيعات سعودي في بيئة عمل"
                loading="lazy"
                width="620"
                height="317"
              />
              <p className="problem__visual-caption">
                188 دورة · +20 خبيراً · +7 قطاعات — كلها في خدمة المحادثة التي تُغلق الصفقة.
              </p>
            </div>
          </Reveal>

          <div className="problem__grid stack" ref={stackRef}>
            {problem.cards.map((card, index) => {
              const Icon = cardIcons[index] ?? Percent
              return (
                <div className="stack__item" key={card.title}>
                  <Reveal className="stack__card" delay={index * 0.04}>
                    <article className={`problem-card problem-card--${card.tone} card-glow glow-${card.tone}`}>
                      <span className="problem-card__icon">
                        <Icon aria-hidden="true" />
                      </span>
                      <span className="problem-card__index">{card.index}</span>
                      <h3>{card.title}</h3>
                      <p>{card.body}</p>
                    </article>
                  </Reveal>
                </div>
              )
            })}
          </div>
        </div>

        <Reveal delay={0.08}>
          <p className="problem__transition">
            {problem.transition.split('وهذا بالضبط')[0]}
            <b>وهذا بالضبط ما تبنيه ماستري لفريقك.</b>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
