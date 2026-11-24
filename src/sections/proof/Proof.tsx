import { BookOpen, Building2, GraduationCap, UsersRound } from 'lucide-react'
import { clientLogos, stats } from '../../content/ar'
import { CountUp } from '../../motion/CountUp'
import { Marquee } from '../../motion/Marquee'
import { Accreditations } from './Accreditations'

const statIcons = [
  { Icon: BookOpen, tone: 'coral' },
  { Icon: UsersRound, tone: 'yellow' },
  { Icon: Building2, tone: 'purple' },
  { Icon: GraduationCap, tone: 'sky' },
] as const

/** Off-white, transparent copies of the client logos (public/assets/logos/mono). */
const monoLogo = (src: string) => src.replace('/assets/logos/', '/assets/logos/mono/')

/**
 * The proof band: client logos (one off-white tone), the
 * Mastery numbers, then the accrediting bodies. Dark in both themes.
 */
export function Proof() {
  return (
    <section className="proof" id="clients" aria-labelledby="proof-title">
      <div className="ma-container">
        <h2 className="proof__label" id="proof-title">
          شركات تثق بماستري لتدريب فرق مبيعاتها
        </h2>
        <p className="proof__sub">التجارة والتجزئة · العقار · التأمين · التمويل · الصحة</p>
      </div>

      <div className="proof__belt">
        <Marquee label="شعارات عملاء ماستري">
          {clientLogos.map((logo) => (
            <span className="proof-logo" key={logo.name} title={logo.name}>
              <img src={monoLogo(logo.src)} alt={logo.name} loading="lazy" decoding="async" />
            </span>
          ))}
        </Marquee>
      </div>

      <div className="ma-container">
        <div className="proof__stats">
          {stats.map((stat, index) => {
            const { Icon, tone } = statIcons[index] ?? statIcons[0]
            const prefix = 'prefix' in stat ? stat.prefix : undefined
            return (
              <div className="proof-stat" key={stat.label}>
                <CountUp
                  className="proof-stat__value"
                  value={stat.value}
                  prefix={prefix}
                  label={`${prefix ?? ''}${stat.value} ${stat.label}`}
                />
                <div className="proof-stat__label">
                  <Icon className={`proof-stat__icon proof-stat__icon--${tone}`} aria-hidden="true" />
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>

        <Accreditations />
      </div>
    </section>
  )
}
