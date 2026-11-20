import { BookOpen, Building2, GraduationCap, UsersRound } from 'lucide-react'
import { clientLogos, stats } from '../content/ar'
import { CountUp } from '../motion/CountUp'
import { Marquee } from '../motion/Marquee'
import { Reveal } from '../motion/Reveal'

const statIcons = [BookOpen, UsersRound, Building2, GraduationCap] as const

export function Logos() {
  return (
    <section className="section section--tight logos" id="clients">
      <div className="ma-container">
        <Reveal>
          <p className="logos__label">
            شركات رائدة في التجارة والعقار والتأمين والتمويل والصحة اختارت ماستري لتطوير فرقها
          </p>
        </Reveal>

        <Marquee label="شعارات عملاء ماستري">
          {clientLogos.map((logo) => (
            <span className="logo-tile" key={logo.name}>
              <img src={logo.src} alt={logo.name} />
            </span>
          ))}
        </Marquee>

        <div className="stats">
          {stats.map((stat, index) => {
            const Icon = statIcons[index] ?? BookOpen
            return (
            <div className="stat" key={stat.label}>
              <CountUp
                className="stat__value"
                value={stat.value}
                prefix={'prefix' in stat ? stat.prefix : undefined}
                label={`${'prefix' in stat ? stat.prefix : ''}${stat.value} ${stat.label}`}
              />
              <div className="stat__label">
                <Icon aria-hidden="true" />
                {stat.label}
              </div>
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
