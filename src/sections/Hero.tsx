import { Clock3 } from 'lucide-react'
import { Icon } from '../ui/Icon'
import { accreditations, hero } from '../content/ar'
import { CountUp } from '../motion/CountUp'
import { Button } from '../ui/Button'
import { HeroDemo } from './hero/HeroDemo'

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="ma-container hero__grid">
        <div className="hero__copy hero-enter">
          <span className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            {hero.eyebrow}
          </span>
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
              <Icon name="arrow" className="btn-arrow" size={20} />
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

        <div className="hero__demo-wrap hero-enter hero-enter--delay">
          <HeroDemo />
        </div>
      </div>

      <div className="ma-container">
        <div className="hero__results">
          {hero.results.map((result) => (
            <div className="hero__result" key={result.label}>
              <CountUp
                className="hero__result-value"
                value={result.value}
                prefix={result.prefix}
                suffix={result.suffix}
                label={`${result.prefix}${result.value}${result.suffix} ${result.label}`}
              />
              <div className="hero__result-label">{result.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero__accreditations">
        <div className="ma-container accreditations">
          <span className="accreditations__label">برامج معتمدة من:</span>
          {accreditations.map((item) => (
            <span className="accreditation" key={item.name} title={item.name}>
              <img src={item.src} alt={item.name} loading="lazy" width="64" height="28" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
