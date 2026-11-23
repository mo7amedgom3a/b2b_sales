import { Check, Gift, Minus, Plus, Sparkles, UsersRound } from 'lucide-react'
import { pricing, site } from '../content/ar'
import { Stagger, StaggerItem } from '../motion/Stagger'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'
import { Todo } from '../ui/Todo'
import { cn } from '../lib/cx'

type Plan = (typeof pricing.plans)[number]

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <article className={cn('plan', plan.featured && 'plan--featured')}>
      {plan.tag ? (
        <span className="plan__tag">
          <Tag tone="coral">{plan.tag}</Tag>
        </span>
      ) : null}

      <div className="plan__name">{plan.name}</div>
      <div className="plan__team">
        <UsersRound className="icon-pop" aria-hidden="true" />
        {plan.team}
      </div>

      <div className="plan__price">
        <span>{plan.price}</span>
        <small>ريال / موظف سنوياً</small>
      </div>
      <div className="plan__monthly">ما يعادل {plan.monthly}</div>

      <ul className="plan__features">
        {plan.features.map((feature) => (
          <li
            className={feature.included ? 'plan__feature' : 'plan__feature plan__feature--muted'}
            key={feature.label}
          >
            {feature.included ? <Check aria-hidden="true" /> : <Minus aria-hidden="true" />}
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      {plan.save ? <span className="plan__save">{plan.save}</span> : null}

      {plan.badge ? (
        <div className="plan__badge">
          <Gift aria-hidden="true" />
          <span>{plan.badge}</span>
        </div>
      ) : null}

      <div className="plan__cta">
        <Button
          href={plan.id === 'lead' ? site.whatsappHref : '#booking'}
          target={plan.id === 'lead' ? '_blank' : undefined}
          rel={plan.id === 'lead' ? 'noopener noreferrer' : undefined}
          variant={plan.featured ? 'primary' : 'soft'}
          block
        >
          {plan.cta}
        </Button>
      </div>
    </article>
  )
}

export function Pricing() {
  return (
    <section className="section section--band pricing" id="pricing">
      <div className="ma-container">
        <SecHead index="11" title={pricing.title} lead={pricing.lead} />

        <Stagger className="plans">
          {pricing.plans.map((plan) => (
            <StaggerItem className="plan-slot" key={plan.id}>
              {plan.featured ? (
                <div className="plan-glow">
                  <PlanCard plan={plan} />
                </div>
              ) : (
                <PlanCard plan={plan} />
              )}
            </StaggerItem>
          ))}
        </Stagger>

        <p className="pricing__note">{pricing.note}</p>
        <p className="pricing__friend">
          {pricing.friendNote} <Todo>آلية الفوترة وعدد الشركات المسموح دعوتها</Todo>
        </p>

        <div className="matrix">
          <details className="matrix__details">
            <summary className="matrix__summary">
              <span>قارن كل المزايا</span>
              <Plus aria-hidden="true" />
            </summary>

            <table className="matrix__table">
              <thead>
                <tr>
                  <th scope="col">الميزة</th>
                  {pricing.plans.map((plan) => (
                    <th scope="col" key={plan.id}>
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pricing.matrix.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {row.values.map((value, index) => (
                      <td
                        className={value === '—' ? 'is-muted' : 'is-included'}
                        key={`${row.label}-${pricing.plans[index]?.id ?? index}`}
                      >
                        {value === '✓' ? <Check size={14} aria-label="مشمولة" /> : value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="matrix__mobile">
              {pricing.plans.map((plan, index) => (
                <details className="matrix__plan" key={plan.id}>
                  <summary>{plan.name}</summary>
                  <ul>
                    {pricing.matrix.map((row) => {
                      const value = row.values[index]
                      if (!value || value === '—') return null
                      return (
                        <li key={row.label}>
                          <Check aria-hidden="true" />
                          <span>
                            {row.label}
                            {value === '✓' ? '' : `: ${value}`}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </details>
              ))}
            </div>
          </details>
        </div>

        <div className="addons">
          <div className="addons__head">
            <div>
              <h3>{pricing.addonsTitle}</h3>
              <p>{pricing.addonsLead}</p>
            </div>
            <Sparkles aria-hidden="true" size={20} style={{ color: 'var(--coral)' }} />
          </div>

          <div className="addons__grid">
            {pricing.addons.map((addon, index) => (
              <Reveal className="addon" key={addon.title} delay={index * 0.03}>
                <div className="addon__index">0{index + 1}</div>
                <h4>{addon.title}</h4>
                <p>{addon.body}</p>
              </Reveal>
            ))}
          </div>

          <div className="addons__cta">
            <Button href={site.whatsappHref} target="_blank" rel="noopener noreferrer" variant="primary">
              {pricing.addonsCta}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
