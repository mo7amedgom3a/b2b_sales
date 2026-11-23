import type { LucideIcon } from 'lucide-react'
import { Hash } from 'lucide-react'
import { site } from '../content/ar'
import { GlassText } from '../motion/GlassText'

type SecHeadProps = {
  index: string
  title: string
  lead?: string
  center?: boolean
  /** Section icon shown in the run line and as the title badge. */
  icon?: LucideIcon
}

export function SecHead({ index, title, lead, center, icon: Icon = Hash }: SecHeadProps) {
  return (
    <header className={center ? 'ma-sechead section-head section-head--center' : 'ma-sechead section-head'}>
      <div className="ma-sechead__run">
        <span className="ma-sechead__crumb">
          <Icon className="ma-sechead__run-icon" aria-hidden="true" />
          الأعمال / {index}
        </span>
        <span>{site.shortName}</span>
      </div>
      <h2 className="ma-sechead__title">
        <GlassText>{title}</GlassText>
      </h2>
      {lead ? <p className="ma-sechead__lead">{lead}</p> : null}
    </header>
  )
}
