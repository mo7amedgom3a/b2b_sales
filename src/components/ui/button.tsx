import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * shadcn/ui Button. Variants resolve to the Mastery kit classes (ma-btn--*),
 * which already carry the coral/ink tokens for light and dark themes.
 */
export const buttonVariants = cva('ma-btn select-none [&_svg]:pointer-events-none [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'ma-btn--primary',
      primary: 'ma-btn--primary',
      secondary: 'ma-btn--secondary',
      soft: 'ma-btn--soft',
      outline: 'ma-btn--soft',
      ghost: 'ma-btn--ghost',
      bare: 'ma-btn--bare',
      'on-color': 'ma-btn--on-color',
      'on-ink': 'btn-on-ink',
    },
    size: {
      default: '',
      md: '',
      sm: 'ma-btn--sm',
      lg: 'ma-btn--lg',
      icon: 'ma-btn--icon',
    },
    block: { true: 'ma-btn--block', false: '' },
  },
  defaultVariants: { variant: 'default', size: 'default', block: false },
})

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

export function Button({
  className,
  variant,
  size,
  block,
  asChild = false,
  ...props
}: ComponentProps<'button'> & ButtonVariantProps & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, block }), className)} {...props} />
}
