import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** shadcn/ui Badge on the kit tag. `soft` follows the theme (readable in dark mode). */
export const badgeVariants = cva('ma-tag [&_svg]:size-3 [&_svg]:shrink-0', {
  variants: {
    variant: {
      default: 'ma-tag--coral',
      soft: 'ma-tag--soft',
      outline: 'ma-tag--outline',
      coral: 'ma-tag--coral',
      yellow: 'ma-tag--yellow',
      purple: 'ma-tag--purple',
      sky: 'ma-tag--sky',
      pink: 'ma-tag--pink',
      teal: 'ma-tag--teal',
      lilac: 'ma-tag--lilac',
      green: 'ma-tag--green',
      cream: 'ma-tag--cream',
      ink: 'ma-tag--ink',
    },
  },
  defaultVariants: { variant: 'soft' },
})

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>

export function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}
