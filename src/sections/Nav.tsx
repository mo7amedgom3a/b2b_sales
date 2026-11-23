import { useEffect, useState } from 'react'
import { ArrowUpLeft, Bot, CircleHelp, Library, Package, Route, Trophy } from 'lucide-react'
import { navLinks, site } from '../content/ar'
import { useActiveSection } from '../hooks/useActiveSection'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/cx'
import { AnimateIcon, AnimatedMenu, AnimatedMoon, AnimatedSun, AnimatedX } from '../ui/animated-icons'

const SECTION_IDS = ['paths', 'library', 'ai', 'stories', 'pricing', 'faq'] as const

const linkIcons = {
  '#paths': Route,
  '#library': Library,
  '#ai': Bot,
  '#stories': Trophy,
  '#pricing': Package,
  '#faq': CircleHelp,
} as const

export function Nav() {
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const { theme, toggle } = useTheme()
  const active = useActiveSection(SECTION_IDS)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="nav">
      <div className="ma-container nav__inner">
        <a className="nav__brand" href="#top" aria-label={site.name}>
          <svg className="ma-logo" width="150" height="17" role="img" aria-label="Mastery Academy">
            <use href="#ma-logo" />
          </svg>
          <span className="nav__b2b">الأعمال</span>
        </a>

        <nav aria-label="التنقل الرئيسي">
          <ul className="ma-nav__links nav__links">
            {navLinks.map((link) => {
              const Icon = linkIcons[link.href as keyof typeof linkIcons] ?? Route
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    aria-current={active === link.href.slice(1) ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <Icon aria-hidden="true" />
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ma-nav__actions nav__actions">
          <button
            className="ma-btn ma-btn--bare ma-btn--icon nav__theme"
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
            title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
          >
            {theme === 'dark' ? (
              <AnimateIcon animateOnHover>
                <AnimatedSun size={20} />
              </AnimateIcon>
            ) : (
              <AnimateIcon animateOnHover>
                <AnimatedMoon size={20} />
              </AnimateIcon>
            )}
          </button>
          <a className="ma-btn ma-btn--primary ma-btn--sm nav__cta" href="#booking">
            احجز جلسة تشخيص
          </a>
          <button
            className="ma-btn ma-btn--bare ma-btn--icon nav__menu"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {open ? (
              <AnimateIcon animateOnHover>
                <AnimatedX size={22} />
              </AnimateIcon>
            ) : (
              <AnimateIcon animateOnHover>
                <AnimatedMenu size={22} />
              </AnimateIcon>
            )}
          </button>
        </div>
      </div>

      <div style={{ height: 2, overflow: 'hidden' }} aria-hidden="true">
        <div className="nav__progress" style={{ transform: `scaleX(${progress})` }} />
      </div>

      {open ? (
        <div className="nav__mobile" id="mobile-menu">
          <div className="ma-container">
            <ul className="nav__mobile-list">
              {navLinks.map((link) => {
                const Icon = linkIcons[link.href as keyof typeof linkIcons] ?? Route
                return (
                  <li key={link.href}>
                    <a href={link.href} onClick={() => setOpen(false)}>
                      <Icon aria-hidden="true" />
                      <span>{link.label}</span>
                      <ArrowUpLeft size={16} aria-hidden="true" />
                    </a>
                  </li>
                )
              })}
            </ul>
            <div className="nav__mobile-actions">
              <a
                className={cn('ma-btn', 'ma-btn--primary', 'ma-btn--block')}
                href="#booking"
                onClick={() => setOpen(false)}
              >
                احجز جلسة تشخيص
              </a>
              <a
                className={cn('ma-btn', 'ma-btn--soft', 'ma-btn--block')}
                href={site.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                واتساب
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
