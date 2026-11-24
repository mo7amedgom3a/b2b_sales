import { lazy, Suspense, useEffect, useState } from 'react'
import { Nav } from './sections/Nav'
import { Hero } from './sections/hero/Hero'
import { Footer } from './sections/Footer'
import { Sprite } from './ui/Sprite'
import { WhatsAppFab } from './ui/WhatsAppFab'

const Below = lazy(() => import('./Below'))

function BelowFallback() {
  return (
    <div className="section section--tight">
      <div className="ma-container">
        <div className="boot-skeleton" aria-hidden="true" />
        <span className="sr-only">جارٍ تحميل بقية الصفحة…</span>
      </div>
    </div>
  )
}

export default function App() {
  const [showBelow, setShowBelow] = useState(false)

  useEffect(() => {
    // Let the hero's JS and headline font win the first bandwidth window.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setShowBelow(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const timer = window.setTimeout(() => setShowBelow(true), 900)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <>
      <Sprite />
      <a className="skip-link" href="#main">
        تخطَّ إلى المحتوى
      </a>
      <Nav />
      <main id="main">
        <Hero />
        {showBelow ? (
          <Suspense fallback={<BelowFallback />}>
            <Below />
          </Suspense>
        ) : (
          <BelowFallback />
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  )
}
