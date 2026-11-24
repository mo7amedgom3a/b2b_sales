import { ArrowRight, Clock3 } from 'lucide-react'
import { hero } from '../../content/ar'
import { Button } from '../../ui/Button'
import { HeroRotator } from './HeroRotator'
import { HeroVideo } from './HeroVideo'

/** Centered opener: eyebrow → title → rotating claim → one CTA, then the video stage. */
export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="ma-container hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 className="hero__title">
            <span className="hero__title-main">{hero.title}</span>
            <HeroRotator phrases={hero.rotator} />
          </h1>
          <div className="hero__ctas">
            <Button href="#booking" variant="primary" size="lg">
              {hero.primary}
              <ArrowRight className="btn-arrow icon-inline" size={20} aria-hidden="true" />
            </Button>
          </div>
          <p className="hero__note">
            <Clock3 aria-hidden="true" />
            {hero.note}
          </p>
        </div>
      </div>

      <HeroVideo />
    </section>
  )
}
