import { site } from '../content/ar'
import { GlassText } from '../motion/GlassText'

type SecHeadProps = {
  index: string
  title: string
  lead?: string
  center?: boolean
}

export function SecHead({ index, title, lead, center }: SecHeadProps) {
  return (
    <header className={center ? 'ma-sechead section-head section-head--center' : 'ma-sechead section-head'}>
      <div className="ma-sechead__run">
        <span>الأعمال / {index}</span>
        <span>{site.shortName}</span>
      </div>
      <h2 className="ma-sechead__title"><GlassText>{title}</GlassText></h2>
      {lead ? <p className="ma-sechead__lead">{lead}</p> : null}
    </header>
  )
}
