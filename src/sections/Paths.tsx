import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarClock,
  ChevronDown,
  Clock3,
  Globe,
  Headset,
  Layers,
  type LucideIcon,
  MapPin,
  Phone,
  Route,
  Shuffle,
  Sparkles,
  Store,
  Target,
  TriangleAlert,
  UserCog,
  UsersRound,
  Wand2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { paths } from '../content/ar'
import { SITE_URL } from '../lib/api'
import { useB2BTrack, usePathCourses } from '../lib/usePathCourses'
import type { PathCourse } from '../lib/usePathCourses'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterChars } from '../motion/TypewriterText'
import { useExitGhosts, useTypewriter } from '../motion/useTypewriter'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'
import { Todo } from '../ui/Todo'

type Selection = Record<string, number>

const initialSelection: Selection = { competency: 0, gap: 2, sector: 1, level: 0 }

const dimensionIcons: Record<string, LucideIcon> = {
  competency: Target,
  gap: TriangleAlert,
  sector: Building2,
  level: UserCog,
}

const envIcons: LucideIcon[] = [MapPin, Store, Phone, Globe, Headset]

function initialOf(name: string | null) {
  const cleaned = (name ?? '').replace(/^(د|أ|م|م\.|د\.|أ\.)\.?\s*/u, '').trim()
  return Array.from(cleaned)[0] ?? 'م'
}

function CourseRow({ course, index }: { course: PathCourse; index: number }) {
  return (
    <motion.li
      className="path-course"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.32, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="path-course__step">{index + 1}</span>
      <span className="path-course__thumb">
        {course.image ? (
          <img src={course.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <BookOpen aria-hidden="true" />
        )}
      </span>
      <span className="path-course__body">
        <a
          className="path-course__title"
          href={`${SITE_URL}/courses/${course.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {course.title}
        </a>
        <span className="path-course__meta">
          {course.instructor ? (
            <span className="path-course__trainer">
              <Avatar className="size-[18px]">
                {course.avatar ? <AvatarImage src={course.avatar} alt="" /> : null}
                <AvatarFallback className="text-[9px]">{initialOf(course.instructor)}</AvatarFallback>
              </Avatar>
              {course.instructor}
            </span>
          ) : null}
          {course.duration ? (
            <span>
              <Clock3 aria-hidden="true" /> {course.duration}
            </span>
          ) : null}
          {course.lessons ? (
            <span>
              <Layers aria-hidden="true" /> {course.lessons} درساً
            </span>
          ) : null}
        </span>
      </span>
    </motion.li>
  )
}

function TrainerStack({ courses }: { courses: PathCourse[] }) {
  const trainers = Array.from(
    new Map(courses.filter((course) => course.instructor).map((course) => [course.instructor, course])).values(),
  )
  if (trainers.length === 0) return null
  return (
    <div className="trainer-stack" aria-label={`${trainers.length} خبراء في هذا المسار`}>
      <div className="trainer-stack__avatars">
        {trainers.map((course) => (
          <Avatar className="trainer-stack__avatar size-7" key={course.instructor}>
            {course.avatar ? <AvatarImage src={course.avatar} alt={course.instructor ?? ''} /> : null}
            <AvatarFallback className="text-[11px]">{initialOf(course.instructor)}</AvatarFallback>
          </Avatar>
        ))}
      </div>
      <span>
        <UsersRound aria-hidden="true" /> {trainers.length} خبراء يدرّبون هذا المسار
      </span>
    </div>
  )
}

export function Paths() {
  const reduce = useReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.25 })
  const [narrow, setNarrow] = useState(false)
  /** Phones: which option group is expanded (the rest show only their current pick). */
  const [openDim, setOpenDim] = useState<string | null>(null)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 899px)')
    const update = () => setNarrow(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  const [selection, setSelection] = useState<Selection>(initialSelection)

  useEffect(() => {
    if (reduce || paused) return
    const timer = window.setInterval(() => {
      const dim = paths.dimensions[Math.floor(Math.random() * paths.dimensions.length)]
      if (!dim) return
      const index = Math.floor(Math.random() * dim.options.length)
      setSelection((current) => ({ ...current, [dim.key]: index }))
    }, 5200)
    return () => window.clearInterval(timer)
  }, [reduce, paused, selection])

  const optionOf = (key: string) => {
    const dim = paths.dimensions.find((item) => item.key === key)
    if (!dim) return ''
    return dim.options[selection[key] ?? 0] ?? dim.options[0] ?? ''
  }

  const competencyDim = paths.dimensions.find((item) => item.key === 'competency')
  const competencyTerm =
    (competencyDim && 'terms' in competencyDim ? competencyDim.terms[selection.competency ?? 0] : undefined) ??
    optionOf('competency')
  const trackKey =
    competencyDim && 'tracks' in competencyDim ? competencyDim.tracks[selection.competency ?? 0] : undefined
  const { courses, status } = usePathCourses(competencyTerm, optionOf('gap'), trackKey)
  const track = useB2BTrack(trackKey)

  const composed = `مسار ${optionOf('level')} في ${optionOf('sector')} — يعالج فجوة «${optionOf('gap')}» ويبني جدارة «${optionOf('competency')}».`
  const { text: typedPath, phase } = useTypewriter([composed], {
    loop: false,
    restartKey: composed,
    holdMs: 60_000,
    paused,
    jitterMs: [14, 30],
    punctuationHoldMs: 60,
  })
  const ghosts = useExitGhosts(typedPath)
  const typed = phase !== 'typing' || reduce

  const progress = Math.max(
    6,
    Math.round((Array.from(typedPath).length / Math.max(1, Array.from(composed).length)) * 100),
  )

  const shuffle = () => {
    setSelection(
      Object.fromEntries(
        paths.dimensions.map((dim) => [dim.key, Math.floor(Math.random() * dim.options.length)]),
      ),
    )
  }

  return (
    <section className="section section--band paths" id="paths">
      <div className="ma-container">
        <SecHead index="05" title={paths.title} lead={paths.lead} icon={Route} />

        <div className="paths__grid">
          <div className="dim">
            {paths.dimensions.map((dim) => {
              const Icon = dimensionIcons[dim.key] ?? Target
              const isOpen = !narrow || openDim === dim.key
              const panelId = `dim-${dim.key}`
              return (
                <div className={isOpen ? 'dim__row is-open' : 'dim__row'} key={dim.key}>
                  <div className="dim__label">
                    <Icon className="dim__icon" aria-hidden="true" />
                    {dim.label}
                    {'hint' in dim && dim.hint ? <span className="dim__hint">{dim.hint}</span> : null}
                  </div>
                  {/* Phones: one compact row per group with its current pick; tap to change. */}
                  <button
                    type="button"
                    className="dim__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenDim((current) => (current === dim.key ? null : dim.key))}
                  >
                    <Icon className="dim__icon" aria-hidden="true" />
                    <span className="dim__toggle-label">{dim.label}</span>
                    <span className="dim__toggle-value" key={optionOf(dim.key)}>
                      {optionOf(dim.key)}
                    </span>
                    <ChevronDown className="dim__chevron" aria-hidden="true" />
                  </button>
                  <div className="dim__panel" id={panelId} hidden={!isOpen}>
                    <ToggleGroup
                      type="single"
                      className="chips"
                      aria-label={dim.label}
                      value={String(selection[dim.key] ?? 0)}
                      onValueChange={(value) => {
                        if (!value) return
                        // The pick shows at once; the random walk carries on from it.
                        setSelection((current) => ({ ...current, [dim.key]: Number(value) }))
                        // Phones: close the group so the path card right below is in view.
                        if (narrow) setOpenDim(null)
                      }}
                    >
                      {dim.options.map((option, index) => (
                        <ToggleGroupItem className="chip" value={String(index)} key={option}>
                          {option}
                        </ToggleGroupItem>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>
              )
            })}
          </div>

          <div ref={ref} {...hoverProps}>
            <Reveal delay={0.08}>
              <div className="builder">
                <div className="builder__top">
                  <span className="builder__title">
                    <Wand2 aria-hidden="true" />
                    {paths.builder.title}
                  </span>
                  <span className="builder__actions">
                    <Tag tone="soft" icon={<Sparkles aria-hidden="true" />}>أكثر من 1000 احتمال</Tag>
                    <button type="button" className="builder__shuffle" onClick={shuffle} aria-label="مسار عشوائي">
                      <Shuffle aria-hidden="true" />
                    </button>
                  </span>
                </div>
                <div className="builder__body">
                  <div className="builder__path">
                    <TypewriterChars text={typedPath} ghosts={ghosts} caret={!typed} phase={phase} />
                    <span className="sr-only" aria-live="polite">
                      {typed ? composed : ''}
                    </span>
                  </div>
                  <div className="builder__meta">
                    <Tag tone="yellow" icon={<UserCog aria-hidden="true" />}>{optionOf('level')}</Tag>
                    <Tag tone="sky" icon={<Building2 aria-hidden="true" />}>{optionOf('sector')}</Tag>
                    <Tag tone="coral" icon={<TriangleAlert aria-hidden="true" />}>{optionOf('gap')}</Tag>
                    <Tag tone="soft" icon={<Target aria-hidden="true" />}>{optionOf('competency')}</Tag>
                  </div>
                  <div className="builder__bar">
                    <div className="track">
                      <div className="fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="builder__courses">
                    <span className="builder__courses-title">
                      <BookOpen aria-hidden="true" />
                      {paths.coursesTitle}
                      {status === 'live' ? <span className="builder__live" aria-label="بيانات مباشرة" /> : null}
                    </span>
                    {track ? (
                      <span className="builder__track" title={track.categories.map((item) => item.name).join(' · ')}>
                        <Layers aria-hidden="true" />
                        مسار {track.name}
                        <span aria-hidden="true">·</span>
                        {track.categories.length} مجالات · {track.program_count} برنامج
                      </span>
                    ) : null}
                    {status === 'loading' || !typed ? (
                      <div className="builder__loading" aria-hidden="true">
                        {[0, 1, 2].map((item) => (
                          <div className="path-course path-course--ghost" key={item}>
                            <Skeleton className="size-9 rounded-md" />
                            <span className="flex flex-1 flex-col gap-1.5">
                              <Skeleton className="h-2.5 w-3/4" />
                              <Skeleton className="h-2 w-1/2" />
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <ul className="path-courses" key={courses.map((course) => course.slug).join()}>
                          <AnimatePresence initial>
                            {courses.map((course, index) => (
                              <CourseRow course={course} index={index} key={course.slug} />
                            ))}
                          </AnimatePresence>
                        </ul>
                        <TrainerStack courses={courses} />
                      </>
                    )}
                  </div>

                  <div className="builder__foot">
                    <span>
                      <CalendarClock aria-hidden="true" />
                      {paths.builder.note}
                    </span>
                    <span className="builder__count">
                      <Layers aria-hidden="true" /> 4 أبعاد
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="paths__envs">
          <h3>
            <MapPin aria-hidden="true" /> بيئات البيع التي نغطيها
          </h3>
          <div className="chips">
            {paths.envs.map((env, index) => {
              const Icon = envIcons[index] ?? MapPin
              return (
                <span className="env-chip" key={env}>
                  <Icon aria-hidden="true" />
                  {env}
                </span>
              )
            })}
          </div>
        </div>

        <Reveal>
          <p className="paths__example">
            <Sparkles size={14} aria-hidden="true" className="paths__example-icon" />
            {paths.example} <Todo>بقية القطاعات السبعة</Todo>
          </p>
          <div className="paths__cta">
            <Button href="#booking" variant="primary">
              {paths.cta}
              <ArrowRight className="btn-arrow" size={18} aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
