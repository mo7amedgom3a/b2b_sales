import { ArrowRight, BadgeCheck, Clock3, Timer, TrendingUp, UsersRound } from 'lucide-react'
import { accreditations, hero } from '../content/ar'
import { CountUp } from '../motion/CountUp'
import { Button } from '../ui/Button'
import { HeroDemo } from './hero/HeroDemo'

const resultIcons = [TrendingUp, Timer, UsersRound] as const

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="ma-container hero__grid">
        <div className="hero__copy hero-enter">
          <h1 className="hero__title">
            {hero.titleStart}{' '}
            <span className="hero__mark">
              <span className="hero__mark-text">{hero.titleMark}</span>
            </span>
          </h1>
          <p className="hero__sub">{hero.sub}</p>
          <div className="hero__ctas">
            <Button href="#booking" variant="primary" size="lg">
              {hero.primary}
              <ArrowRight className="btn-arrow icon-inline" size={20} aria-hidden="true" />
            </Button>
            <Button href="#stories" variant="soft" size="lg">
              {hero.secondary}
            </Button>
          </div>
          <p className="hero__note">
            <Clock3 className="icon-clock" aria-hidden="true" />
            {hero.note}
          </p>
        </div>

        <div className="hero__demo-wrap hero-enter hero-enter--delay card-glow glow-purple">
          <HeroDemo />
        </div>
      </div>

      <div className="ma-container">
        <div className="hero__results">
          {hero.results.map((result, index) => {
            const Icon = resultIcons[index] ?? TrendingUp
            return (
              <div className="hero__result" key={result.label}>
                <CountUp
                  className="hero__result-value"
                  value={result.value}
                  prefix={result.prefix}
                  suffix={result.suffix}
                  label={`${result.prefix}${result.value}${result.suffix} ${result.label}`}
                />
                <div className="hero__result-label">
                  <Icon aria-hidden="true" />
                  {result.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="hero__accreditations">
        <div className="ma-container accreditations">
          <span className="accreditations__label">برامج معتمدة من:</span>
          {accreditations.map((item) => (
            <span className="accreditation" key={item.name} title={item.name}>
              <img src={item.src} alt={item.name} loading="lazy" width="92" height="42" />
              <span className="accreditation__body">
                <span className="accreditation__name">{item.name}</span>
                <span className="accreditation__short">
                  <BadgeCheck aria-hidden="true" />
                  {item.short}
                </span>
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
