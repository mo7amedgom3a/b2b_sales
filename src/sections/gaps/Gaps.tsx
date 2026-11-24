import { Briefcase, Lightbulb, TrendingDown, UserRoundMinus, UsersRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { gaps } from '../../content/ar'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { loadGsap } from '../../motion/gsap'
import { SecHead } from '../../ui/SecHead'
import { GapCard } from './GapCard'

type GroupKey = (typeof gaps.groups)[number]['key']

const groupIcons = { sales: Briefcase, hr: UsersRound } as const

/**
 * Sales + HR gaps, then turnover (the cost both teams share).
 * Desktop: two columns side by side. Mobile: a segmented control switches
 * the group, the cards become a compact list, and turnover stays visible.
 */
export function Gaps() {
  const [active, setActive] = useState<GroupKey>('sales')
  const rootRef = useRef<HTMLDivElement>(null)
  const reduce = usePrefersReducedMotion()

  // One staggered reveal per batch of cards entering the viewport.
  useEffect(() => {
    const root = rootRef.current
    if (!root || reduce) return
    let cancelled = false
    let cleanup = () => {}

    void loadGsap()
      .then(({ gsap, ScrollTrigger }) => {
        if (cancelled) return
        // Desktop only: on phones one group is display:none, so its cards would
        // never "enter" — the mobile switch uses a CSS cross-fade instead.
        const mm = gsap.matchMedia(root)
        mm.add('(min-width: 768px)', () => {
          const cards = gsap.utils.toArray<HTMLElement>('[data-gap-card]', root)
          gsap.set(cards, { autoAlpha: 0, y: 14 })
          ScrollTrigger.batch(cards, {
            start: 'top 90%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: 'power2.out', overwrite: true }),
          })
        })
        cleanup = () => mm.revert()
      })
      .catch(() => {
        // Cards stay visible without GSAP.
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [reduce])

  return (
    <section className="section gaps" id="problem">
      <div className="ma-container" ref={rootRef}>
        <SecHead index="02" title={gaps.title} lead={gaps.body} icon={TrendingDown} />

        <ToggleGroup
          type="single"
          value={active}
          onValueChange={(value) => value && setActive(value as GroupKey)}
          className="gaps__switch"
          aria-label="اختر نوع الفجوات"
        >
          {gaps.groups.map((group) => {
            const Icon = groupIcons[group.key]
            return (
              <ToggleGroupItem value={group.key} key={group.key} showCheck={false} className="gaps__switch-item">
                <Icon aria-hidden="true" />
                {group.short}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>

        <div className="gaps__groups">
          {gaps.groups.map((group) => {
            const Icon = groupIcons[group.key]
            return (
              <div
                className="gaps__group"
                data-group={group.key}
                data-active={group.key === active ? 'true' : 'false'}
                key={group.key}
              >
                <h3 className="gaps__group-title">
                  <Icon aria-hidden="true" />
                  {group.label}
                  <span className="gaps__count">{group.cards.length}</span>
                </h3>
                <ul className="gaps__list">
                  {group.cards.map((card) => (
                    <li key={card.title}>
                      <GapCard icon={card.icon} title={card.title} body={card.body} tone={group.key} />
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="gaps-turnover-wrap focus-glow">
        <article className="gaps-turnover" data-gap-card>
          <span className="gaps-turnover__icon" aria-hidden="true">
            <UserRoundMinus />
          </span>
          <div className="gaps-turnover__body">
            <p className="gaps-turnover__label">{gaps.turnover.label}</p>
            <h3 className="gaps-turnover__title">{gaps.turnover.title}</h3>
            <p className="gaps-turnover__text">{gaps.turnover.body}</p>
          </div>
        </article>
        </div>

        <p className="gaps__transition">
          <Lightbulb className="gaps__transition-icon" aria-hidden="true" />
          {gaps.transitionLead} <b>{gaps.transitionMark}</b>
        </p>
      </div>
    </section>
  )
}
