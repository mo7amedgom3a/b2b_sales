import NumberFlow from '@number-flow/react'
import { useEffect, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

type CountUpProps = {
  value: number
  prefix?: string
  suffix?: string
  className?: string
  label?: string
}

/** NumberFlow that rolls from 0 to the value each time it enters the viewport. */
export function CountUp({ value, prefix = '', suffix = '', className, label }: CountUpProps) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.6)
  const reduce = usePrefersReducedMotion()
  const [display, setDisplay] = useState(() => (reduce ? value : 0))

  useEffect(() => {
    setDisplay(reduce || inView ? value : 0)
  }, [inView, value, reduce])

  const text = label ?? `${prefix}${value}${suffix}`

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" dir="ltr" style={{ unicodeBidi: 'isolate' }}>
        {prefix}
        <NumberFlow value={display} locales="en-US" format={{ useGrouping: true }} />
        {suffix}
      </span>
    </span>
  )
}
