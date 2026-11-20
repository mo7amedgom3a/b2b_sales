import { problem } from '../content/ar'
import { Stagger, StaggerItem } from '../motion/Stagger'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

export function Problem() {
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

          <Stagger className="problem__grid">
            {problem.cards.map((card) => (
              <StaggerItem className={`problem-card problem-card--${card.tone}`} key={card.title}>
                <span className="problem-card__index">{card.index}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
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
