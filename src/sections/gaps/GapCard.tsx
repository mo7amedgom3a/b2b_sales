import { Award, Hourglass, Map, Percent, PhoneMissed, Shuffle, UserCog, UserSearch } from 'lucide-react'

const icons = {
  percent: Percent,
  phone: PhoneMissed,
  shuffle: Shuffle,
  hourglass: Hourglass,
  userSearch: UserSearch,
  award: Award,
  userCog: UserCog,
  map: Map,
} as const

export type GapIcon = keyof typeof icons

export function GapCard({
  icon,
  title,
  body,
  tone,
}: {
  icon: GapIcon
  title: string
  body: string
  tone: 'sales' | 'hr'
}) {
  const Icon = icons[icon]
  return (
    <article className={`gap-card gap-card--${tone}`} data-gap-card>
      <span className="gap-card__icon" aria-hidden="true">
        <Icon />
      </span>
      <div className="gap-card__body">
        <h4 className="gap-card__title">{title}</h4>
        <p className="gap-card__text">{body}</p>
      </div>
    </article>
  )
}
