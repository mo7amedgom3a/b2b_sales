import {
  BookOpen,
  Briefcase,
  Check,
  Compass,
  GraduationCap,
  Presentation,
  RefreshCw,
  Tag as TagIcon,
  UserRoundCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useInViewOnce } from '../hooks/useInViewOnce'
import { trainers } from '../content/ar'
import { fetchExperts } from '../lib/api'
import { mergeTrainers } from '../lib/experts'
import type { TrainerCard } from '../lib/experts'
import { formatNumber } from '../lib/format'
import { Reveal } from '../motion/Reveal'
import { Avatar } from '../ui/Avatar'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const tones = ['coral', 'yellow', 'sky', 'lilac', 'green', 'purple'] as const
const criteriaIcons = [Compass, GraduationCap, Presentation] as const

export function Trainers() {
  const [people, setPeople] = useState<TrainerCard[]>(() => mergeTrainers([]))
  const { ref, inView } = useInViewOnce<HTMLElement>(0.04)

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    fetchExperts()
      .then((experts) => {
        if (!cancelled) setPeople(mergeTrainers(experts))
      })
      .catch(() => {
        // Keep the static README line-up when the public API is unreachable.
      })
    return () => {
      cancelled = true
    }
  }, [inView])

  const live = people.some((person) => person.live)

  return (
    <section ref={ref} className="section section--band trainers" id="trainers">
      <div className="ma-container">
        <SecHead index="10" title={trainers.title} lead={trainers.lead} icon={GraduationCap} />

        <div className="trainers__source">
          <Tag tone="soft" className="library__live">
            <RefreshCw className={live ? 'icon-spin-slow' : undefined} aria-hidden="true" />
            {live ? 'بيانات الخبراء محدّثة من منصة ماستري' : 'فريق الخبراء'}
          </Tag>
        </div>

        <div className="trainers__grid">
          {people.map((person, index) => (
            <Reveal className={`trainer `} key={person.name} delay={index * 0.03}>
              <Avatar
                initial={person.initial}
                tone={person.tone}
                size={64}
                photo={person.photo}
                alt={person.name}
              />
              <div className="trainer__body">
                <div className="trainer__name">{person.name}</div>
                <div className="trainer__role">
                  <Briefcase aria-hidden="true" />
                  {person.role}
                </div>
                <div className="trainer__tag">
                  <Tag tone="soft" icon={<UserRoundCheck aria-hidden="true" />}>مدرب</Tag>
                  {person.category ? (
                    <Tag tone={tones[index % tones.length] ?? 'coral'} icon={<TagIcon aria-hidden="true" />}>
                      {person.category}
                    </Tag>
                  ) : null}
                </div>
                {person.courses && person.courses > 0 ? (
                  <div className="trainer__meta">
                    <BookOpen aria-hidden="true" />
                    {formatNumber(person.courses)} دورات
                  </div>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="trainers__criteria">
          {trainers.criteria.map((criterion, index) => {
            const CriterionIcon = criteriaIcons[index] ?? Check
            return (
              <span key={criterion} data-fx="rise">
                <CriterionIcon aria-hidden="true" />
                {criterion}
              </span>
            )
          })}
        </div>
      </div>
    </section>
  )
}
