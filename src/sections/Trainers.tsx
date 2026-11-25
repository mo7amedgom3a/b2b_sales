import {
  ArrowUpLeft,
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
import { fetchB2BTrainers } from '../lib/api'
import { mergeTrainers } from '../lib/experts'
import type { TrainerCard } from '../lib/experts'
import { formatCount } from '../lib/format'
import { Reveal } from '../motion/Reveal'
import { Avatar } from '../ui/Avatar'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const tones = ['coral', 'yellow', 'sky', 'lilac', 'green', 'purple'] as const
const criteriaIcons = [Compass, GraduationCap, Presentation] as const

/** A founder card links to the public expert profile on the Mastery landing site. */
function FounderCard({ person, delay }: { person: TrainerCard; delay: number }) {
  // «شريك مؤسس والمدير التنفيذي · إتقان المبيعات والتسويق» → «شريك مؤسس والمدير التنفيذي»
  const badge = person.role.split('·')[0]?.trim() || 'شريك مؤسس'

  return (
    <Reveal className="founder-wrap" delay={delay}>
      <a
        className="founder"
        href={person.profile}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`الملف الشخصي لـ${person.name} على منصة ماستري — يفتح في تبويب جديد`}
      >
        <span className="founder__head">
          <Avatar
            initial={person.initial}
            tone={person.tone}
            size={76}
            photo={person.photo}
            alt={person.name}
          />
          <span className="founder__id">
            <span className="founder__eyebrow">{badge}</span>
            <span className="founder__name">{person.name}</span>
            <span className="founder__title">{person.title ?? person.role}</span>
          </span>
        </span>

        {person.bio ? <span className="founder__bio">{person.bio}</span> : null}

        {person.focus?.length ? (
          <span className="founder__focus">
            {person.focus.map((item) => (
              <Tag key={item} tone="soft">
                {item}
              </Tag>
            ))}
          </span>
        ) : null}

        <span className="founder__foot">
          <span className="founder__stats">
            {person.courses && person.courses > 0 ? (
              <span>
                <BookOpen aria-hidden="true" />
                {formatCount(person.courses, 'دورة', 'دورات')}
              </span>
            ) : null}
            {person.diplomas && person.diplomas > 0 ? (
              <span>
                <GraduationCap aria-hidden="true" />
                {formatCount(person.diplomas, 'دبلوم', 'دبلومات')}
              </span>
            ) : null}
          </span>
          <span className="founder__cta">
            الملف الشخصي
            <ArrowUpLeft aria-hidden="true" />
          </span>
        </span>
      </a>
    </Reveal>
  )
}

export function Trainers() {
  const [people, setPeople] = useState<TrainerCard[]>(() => mergeTrainers([]))
  const { ref, inView } = useInViewOnce<HTMLElement>(0.04)

  useEffect(() => {
    if (!inView) return
    let cancelled = false
    fetchB2BTrainers()
      .then((b2b) => {
        if (!cancelled) setPeople(mergeTrainers(b2b))
      })
      .catch(() => {
        // Keep the bundled B2B snapshot when the public API is unreachable.
      })
    return () => {
      cancelled = true
    }
  }, [inView])

  const live = people.some((person) => person.live)
  const founders = people.filter((person) => person.founder)
  const team = people.filter((person) => !person.founder)

  return (
    <section ref={ref} className="section section--band trainers" id="trainers">
      <div className="ma-container">
        <SecHead index="10" title={trainers.title} lead={trainers.lead} icon={GraduationCap} />

        <div className="trainers__source">
          <Tag tone="soft" className="library__live">
            <RefreshCw className={live ? 'icon-spin-slow' : undefined} aria-hidden="true" />
            {live ? 'مدربو مكتبة ماستري للأعمال، محدّثة من المنصة' : 'مدربو مكتبة ماستري للأعمال'}
          </Tag>
        </div>

        {founders.length > 0 ? (
          <div className="trainers__block">
            <div className="trainers__block-head">
              <span className="trainers__block-title">مؤسسا الأكاديمية</span>
              <span className="trainers__block-rule" aria-hidden="true" />
            </div>
            <div className="trainers__founders">
              {founders.map((person, index) => (
                <FounderCard key={person.name} person={person} delay={index * 0.05} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="trainers__block">
          <div className="trainers__block-head">
            <span className="trainers__block-title">فريق الخبراء</span>
            <span className="trainers__block-rule" aria-hidden="true" />
          </div>
          <div className="trainers__grid">
            {team.map((person, index) => (
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
                      {formatCount(person.courses, 'برنامج', 'برامج')} للشركات
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
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
