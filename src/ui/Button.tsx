import type { MouseEventHandler, ReactNode } from 'react'
import { cn } from '../lib/cx'

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'on-color' | 'on-ink'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = {
  children: ReactNode
  variant?: Variant
  size?: Size
  block?: boolean
  className?: string
  href?: string
  type?: 'button' | 'submit'
  onClick?: MouseEventHandler<HTMLElement>
  disabled?: boolean
  ariaLabel?: string
  target?: string
  rel?: string
}

const variantClass: Record<Variant, string> = {
  primary: 'ma-btn--primary',
  secondary: 'ma-btn--secondary',
  soft: 'ma-btn--soft',
  ghost: 'ma-btn--ghost',
  'on-color': 'ma-btn--on-color',
  'on-ink': 'btn-on-ink',
}

const sizeClass: Record<Size, string> = {
  sm: 'ma-btn--sm',
  md: '',
  lg: 'ma-btn--lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  block = false,
  className,
  href,
  type = 'button',
  onClick,
  disabled,
  ariaLabel,
  target,
  rel,
}: ButtonProps) {
  const classes = cn('ma-btn', variantClass[variant], sizeClass[size], block && 'ma-btn--block', className)

  if (href) {
    return (
      <a
        className={classes}
        href={href}
        onClick={onClick}
        aria-label={ariaLabel}
        aria-disabled={disabled || undefined}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    )
  }

  return (
    <button className={classes} type={type} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  )
}
