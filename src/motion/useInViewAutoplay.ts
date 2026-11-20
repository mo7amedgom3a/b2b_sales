import { useEffect, useRef, useState } from 'react'

type Options = {
  threshold?: number
  disabled?: boolean
}

/**
 * Pauses a demo/autoplay when it is off-screen, when the tab is hidden,
 * or when the user hovers/focuses it.
 */
export function useInViewAutoplay<T extends HTMLElement>({ threshold = 0.35, disabled = false }: Options = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  const [hovered, setHovered] = useState(false)
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

  const paused = disabled || !inView || hovered || hidden

  return {
    ref,
    inView,
    paused,
    hoverProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocus: () => setHovered(true),
      onBlur: () => setHovered(false),
    },
  }
}
