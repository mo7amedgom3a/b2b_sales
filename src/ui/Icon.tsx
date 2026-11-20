import type { SVGProps } from 'react'

/** Design-kit glyphs from `assets/sprite.svg` (solid, square-cornered, 24px grid). */
export type IconName =
  | 'arrow'
  | 'arrow-out'
  | 'play'
  | 'sun'
  | 'moon'
  | 'menu'
  | 'close'
  | 'check'
  | 'clock'
  | 'book'
  | 'search'
  | 'alert'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  name: IconName
  size?: number
}

/**
 * `arrow` points right; add `btn-arrow` (or another RTL-flip class) where it
 * means "forward". `arrow-out` (external link) and `play` never mirror.
 */
export function Icon({ name, size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <use href={`#i-${name}`} />
    </svg>
  )
}
