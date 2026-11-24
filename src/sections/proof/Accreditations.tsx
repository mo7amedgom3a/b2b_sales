import { BadgeCheck, ShieldCheck } from 'lucide-react'
import { accreditations, accreditationsLabel } from '../../content/ar'

export function Accreditations() {
  return (
    <div className="accreditations">
      <p className="accreditations__label">
        <ShieldCheck aria-hidden="true" />
        {accreditationsLabel}
      </p>
      <ul className="accreditations__list">
        {accreditations.map((item) => (
          <li className="accreditation" key={item.name}>
            <span className="accreditation__logo">
              <img src={item.src} alt="" loading="lazy" width="92" height="42" />
            </span>
            <span className="accreditation__body">
              <span className="accreditation__name">{item.name}</span>
              <span className="accreditation__short">
                <BadgeCheck aria-hidden="true" />
                {item.short}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
