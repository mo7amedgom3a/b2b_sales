import * as AccordionPrimitive from '@radix-ui/react-accordion'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** shadcn/ui Accordion (Radix). Visuals come from the .faq-item kit styles. */
export function Accordion(props: ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

export function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn('faq-item', className)} {...props} />
}

export function AccordionTrigger({
  className,
  children,
  indicator,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger> & { indicator?: ReactNode }) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn('faq-item__trigger', className)}
        {...props}
      >
        {children}
        {indicator ? (
          <span className="faq-item__icon" aria-hidden="true">
            {indicator}
          </span>
        ) : null}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

export function AccordionContent({ className, children, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content data-slot="accordion-content" className={cn('faq-item__content', className)} {...props}>
      <div className="faq-item__inner">{children}</div>
    </AccordionPrimitive.Content>
  )
}
