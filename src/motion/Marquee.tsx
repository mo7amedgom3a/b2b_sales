import type { ReactNode } from 'react'

type MarqueeProps = {
  children: ReactNode
  label?: string
  className?: string
}

/** CSS-only marquee with an LTR-forced track so it does not jump under RTL. */
export function Marquee({ children, label, className }: MarqueeProps) {
  return (
    <div className={className ? `marquee ${className}` : 'marquee'} role="region" aria-label={label}>
      <div className="marquee__track">
        <div className="marquee__group">{children}</div>
        <div className="marquee__group" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}
