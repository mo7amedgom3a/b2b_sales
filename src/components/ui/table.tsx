import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** shadcn/ui Table; rows animate in when re-keyed (see .ma-table in index.css). */
export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table data-slot="table" className={cn('ma-table w-full caption-bottom', className)} {...props} />
    </div>
  )
}

export function TableHeader(props: ComponentProps<'thead'>) {
  return <thead data-slot="table-header" {...props} />
}

export function TableBody(props: ComponentProps<'tbody'>) {
  return <tbody data-slot="table-body" {...props} />
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return <tr data-slot="table-row" className={cn('ma-table__row', className)} {...props} />
}

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return <th data-slot="table-head" className={className} {...props} />
}

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return <td data-slot="table-cell" className={className} {...props} />
}
