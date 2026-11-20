import { useEffect, useState } from 'react'
import { site } from '../content/ar'

export function WhatsAppFab() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const threshold = window.innerWidth < 768 ? 900 : 620
      const booking = document.getElementById('booking')
      const rect = booking?.getBoundingClientRect()
      const nearBooking = rect ? rect.top < window.innerHeight * 0.9 && rect.bottom > 0 : false
      setVisible(window.scrollY > threshold && !nearBooking)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <a
      className={visible ? 'wa-fab is-visible' : 'wa-fab'}
      href={site.whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`تحدث مع مستشار الآن على واتساب ${site.whatsappNumber}`}
    >
      <span className="wa-fab__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M20.52 3.48A11.87 11.87 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.89c0 2.09.55 4.13 1.6 5.93L.06 24l6.32-1.66a11.85 11.85 0 0 0 5.68 1.45h.01c6.56 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.17-3.44-8.42ZM12.07 21.8h-.01a9.85 9.85 0 0 1-5.02-1.37l-.36-.21-3.75.98 1-3.66-.24-.38a9.85 9.85 0 0 1-1.51-5.26c0-5.45 4.43-9.88 9.89-9.88a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.89 7c0 5.45-4.43 9.88-9.89 9.88Zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </span>
      <span className="wa-fab__label">تحدث مع مستشار الآن</span>
    </a>
  )
}
