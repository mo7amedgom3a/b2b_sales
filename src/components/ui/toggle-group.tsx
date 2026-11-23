import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/**
 * shadcn/ui ToggleGroup. Selected items are coral (the brand red) in both
 * themes and show a check icon.
 */
export function ToggleGroup({ className, ...props }: ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  )
}

export function ToggleGroupItem({
  className,
  children,
  showCheck = true,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item> & { showCheck?: boolean }) {
  return (
    <ToggleGroupPrimitive.Item data-slot="toggle-group-item" className={cn('ma-toggle', className)} {...props}>
      {showCheck ? <Check className="ma-toggle__check" aria-hidden="true" /> : null}
      {children}
    </ToggleGroupPrimitive.Item>
  )
}
