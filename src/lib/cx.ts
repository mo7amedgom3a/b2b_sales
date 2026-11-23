import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export { clsx }

/** shadcn-style class combiner: clsx + tailwind-merge (later utilities win). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
