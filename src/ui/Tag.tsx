import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import type { BadgeVariant } from '@/components/ui/badge'

type Tone = Exclude<BadgeVariant, 'default' | 'outline'>

/** Kit tag → shadcn Badge. `soft` now always gets the theme-aware fill. */
export function Tag({
  children,
  tone = 'soft',
  className,
  icon,
}: {
  children: ReactNode
  tone?: Tone
  className?: string
  icon?: ReactNode
}) {
  return (
    <Badge variant={tone} className={className}>
      {icon}
      {children}
    </Badge>
  )
}
