import { useEffect, useRef, useState } from 'react'

/** Live IntersectionObserver flag — true while visible, false again when it leaves. */
export function useInView<T extends HTMLElement>(threshold = 0.6) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        // Re-arm only once fully out, so a number doesn't reset at the edge of the screen.
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) setInView(true)
        else if (!entry.isIntersecting) setInView(false)
      },
      { threshold: [0, threshold] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}
