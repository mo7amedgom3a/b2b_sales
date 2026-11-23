import type { ComponentProps, MouseEventHandler, ReactNode } from 'react'
import { Button as ShadButton } from '@/components/ui/button'
import type { ButtonVariantProps } from '@/components/ui/button'

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
} & Omit<ComponentProps<'a'>, 'children' | 'onClick' | 'type'>

/**
 * Page-level CTA. Thin adapter over the shadcn/ui Button: renders an anchor
 * (asChild) when `href` is given, otherwise a native button.
 */
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
  ...rest
}: ButtonProps) {
  const variants: ButtonVariantProps = { variant, size, block }

  if (href) {
    return (
      <ShadButton asChild {...variants} className={className}>
        <a
          {...rest}
          href={href}
          onClick={onClick}
          aria-label={ariaLabel}
          aria-disabled={disabled || undefined}
          target={target}
          rel={rel}
        >
          {children}
        </a>
      </ShadButton>
    )
  }

  return (
    <ShadButton
      {...variants}
      className={className}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </ShadButton>
  )
}
