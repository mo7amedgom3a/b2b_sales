import type { ReactNode } from 'react'
import { cn } from '../lib/cx'

type Tone = 'soft' | 'coral' | 'yellow' | 'purple' | 'sky' | 'pink' | 'teal' | 'lilac' | 'green' | 'cream' | 'ink'

export function Tag({ children, tone = 'soft', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return <span className={cn('ma-tag', tone !== 'soft' && `ma-tag--${tone}`, className)}>{children}</span>
}
