import { useEffect, useState } from 'react'
import { useInView } from '../../hooks/useInView'
import { TypewriterText } from '../../motion/TypewriterText'

/**
 * The rotating claim under the hero title («الأولى عربياً» …).
 *
 * Every phrase is also rendered invisibly in the same grid cell, so the line
 * always keeps the size of the longest phrase: typing and erasing never move
 * the CTA below it (no layout shift). Typing pauses off-screen and in a
 * hidden tab.
 */
export function HeroRotator({ phrases }: { phrases: readonly string[] }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.1)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  return (
    <>
      {/* Screen readers get all three claims once, outside the grid stack. */}
      <span className="sr-only">{phrases.join('، ')}</span>
      <span className="hero-rotator" ref={ref} aria-hidden="true">
        {phrases.map((phrase) => (
          <span className="hero-rotator__sizer" key={phrase}>
            {phrase}
          </span>
        ))}
        <span className="hero-rotator__live">
          <TypewriterText
            texts={phrases}
            live={false}
            paused={!inView || hidden}
            jitterMs={[60, 115]}
            punctuationHoldMs={120}
            holdMs={2300}
            eraseMs={34}
            charsPerErase={1}
          />
        </span>
      </span>
    </>
  )
}
