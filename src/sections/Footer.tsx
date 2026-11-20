import { Globe2, Phone } from 'lucide-react'
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
            <h4>{footer.linksTitle}</h4>
            <ul>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
              <li>
                <a href="#booking">احجز جلسة تشخيص</a>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h4>{footer.contactTitle}</h4>
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
            <h4>{footer.accrTitle}</h4>
            <ul>
              {accreditations.map((item) => (
                <li key={item.short}>
                  <span style={{ color: 'rgba(255,255,255,.78)', fontSize: 12 }}>{item.short}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>{footer.copyright}</span>
          <span>ماستري أكاديمي | الأعمال</span>
        </div>
      </div>
    </footer>
  )
}
