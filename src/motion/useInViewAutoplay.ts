import { useEffect, useRef, useState } from 'react'

type Options = {
  threshold?: number
  disabled?: boolean
}

/**
 * Pauses a demo/autoplay only when it is off-screen or the tab is hidden.
 * Hover and focus no longer pause it: the demo keeps playing and keeps
 * moving to the next step while the pointer is over it.
 */
export function useInViewAutoplay<T extends HTMLElement>({ threshold = 0.35, disabled = false }: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) setInView(entry.isIntersecting)
    }, { threshold })

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  const paused = disabled || !inView || hidden

  return {
    ref,
    inView,
    paused,
    /** Kept for call-site compatibility; hovering no longer pauses anything. */
    hoverProps: {},
  }
}
