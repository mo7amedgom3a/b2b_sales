import {
  Building2,
  CalendarCheck,
  ChevronLeft,
  Copyright,
  Globe2,
  Headset,
  Link2,
  Phone,
  ShieldCheck,
} from 'lucide-react'
import { accreditations, footer, navLinks, site } from '../content/ar'

export function Footer() {
  return (
    <footer className="footer">
      <div className="ma-container">
        <div className="footer__grid">
          <div className="footer__brand">
            <svg className="ma-logo" width="168" height="19" role="img" aria-label="Mastery Academy">
              <use href="#ma-logo" />
            </svg>
            <p>
              {site.name} — {footer.tagline}
            </p>
            <div className="footer__accr" aria-label={footer.accrTitle}>
              {accreditations.map((item) => (
                <span className="logo-tile" key={item.name} title={item.name}>
                  <img src={item.src} alt={item.name} loading="lazy" />
                </span>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h4>
              <Link2 aria-hidden="true" />
              {footer.linksTitle}
            </h4>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="footer__link">
                    <ChevronLeft aria-hidden="true" />
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#booking" className="footer__link footer__link--cta">
                  <CalendarCheck aria-hidden="true" />
                  احجز جلسة تشخيص
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>
              <Headset aria-hidden="true" />
              {footer.contactTitle}
            </h4>
            <ul>
              <li>
                <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer">
                  <span className="footer__contact"><Phone aria-hidden="true" /><span dir="ltr">{site.whatsappNumber}</span></span>
                </a>
              </li>
              <li>
                <a href={site.websiteHref} target="_blank" rel="noopener noreferrer">
                  <span className="footer__contact"><Globe2 aria-hidden="true" /><span dir="ltr">{site.website}</span></span>
                </a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>
              <ShieldCheck aria-hidden="true" />
              {footer.accrTitle}
            </h4>
            <ul>
              {accreditations.map((item) => (
                <li key={item.short}>
                  <span className="footer__accr-item">
                    <ShieldCheck aria-hidden="true" />
                    {item.short}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            <Copyright aria-hidden="true" /> {footer.copyright}
          </span>
          <span>
            <Building2 aria-hidden="true" /> ماستري أكاديمي | الأعمال
          </span>
        </div>
      </div>
    </footer>
  )
}
