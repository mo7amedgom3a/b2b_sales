import type { ReactNode } from 'react'

/** Visible only while developing; production copy should not ship with brackets. */
export function Todo({ children }: { children: ReactNode }) {
  if (!import.meta.env.DEV) return null
  return (
    <span className="dev-todo" title="يحتاج تأكيداً قبل النشر">
      TODO · {children}
    </span>
  )
}
