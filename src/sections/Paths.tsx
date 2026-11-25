import {
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
import AIToolCalls, { type ToolCallItem } from '@/components/kokonutui/ai-tool-calls'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { paths } from '../content/ar'
import { SITE_URL } from '../lib/api'
import { useB2BTrack, usePathCourses } from '../lib/usePathCourses'
import type { PathCourse } from '../lib/usePathCourses'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterChars } from '../motion/TypewriterText'
import { useExitGhosts, useTypewriter } from '../motion/useTypewriter'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

type Selection = Record<string, number>

const initialSelection: Selection = { competency: 2, sector: 1, level: 0, env: 0 }

const dimensionIcons: Record<string, LucideIcon> = {
  core: Target,
  competency: Target,
  sector: Building2,
  level: UserCog,
  env: MapPin,
}

/** One icon per sales environment (same order as the `env` options). */
const envIcons: LucideIcon[] = [MapPin, Store, Phone, Globe, Headset]

const dimByKey = (key: string) => paths.dimensions.find((item) => item.key === key)

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
  /** Expanded option groups: «الفجوات والجدارات» starts open, the rest show only their pick. */
  const [openGroups, setOpenGroups] = useState<string[]>(['core'])
  const toggleGroup = (key: string) =>
    setOpenGroups((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]))
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
    const dim = dimByKey(key)
    if (!dim) return ''
    return dim.options[selection[key] ?? 0] ?? dim.options[0] ?? ''
  }

  const competencyDim = paths.dimensions.find((item) => item.key === 'competency')
  const competencyTerm =
    (competencyDim && 'terms' in competencyDim ? competencyDim.terms[selection.competency ?? 0] : undefined) ??
    optionOf('competency')
  const trackKey =
    competencyDim && 'tracks' in competencyDim ? competencyDim.tracks[selection.competency ?? 0] : undefined
  // The gap and the competency are one skill now: search it once, not twice.
  const { courses, status } = usePathCourses(competencyTerm, competencyTerm, trackKey)
  const track = useB2BTrack(trackKey)

  const composed = `مسار ${optionOf('level')} (${optionOf('env')}) في ${optionOf('sector')} — يبني جدارة «${optionOf('competency')}» ويعالج فجوتها.`
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

  // Controlled task states, driven by the typed path and the live course request.
  const searching = status === 'loading'
  const trainerCount = new Set(courses.map((course) => course.instructor).filter(Boolean)).size
  const pathCalls: ToolCallItem[] = [
    {
      id: 'compose',
      tool: 'compose_path',
      icon: <Wand2 aria-hidden="true" />,
      tone: 'sky',
      running: 'يصوغ المسار',
      done: 'صاغ المسار',
      detail: `${optionOf('level')} · ${optionOf('sector')}`,
      result: `${paths.groups.length} أبعاد`,
      state: typed ? 'output-available' : 'input-available',
    },
    ...(typed
      ? ([
          {
            id: 'search',
            tool: 'search_library',
            icon: <BookOpen aria-hidden="true" />,
            tone: 'lilac',
            running: 'يبحث في مكتبة ماستري',
            done: 'بحث في مكتبة ماستري',
            detail: competencyTerm,
            result: `${courses.length} دورات`,
            state: searching ? 'input-available' : 'output-available',
          },
          {
            id: 'trainers',
            tool: 'match_trainers',
            icon: <UsersRound aria-hidden="true" />,
            tone: 'coral',
            running: 'يطابق الخبراء',
            done: 'طابق الخبراء',
            result: trainerCount ? `${trainerCount} خبراء` : 'جاهز',
            state: searching ? 'input-available' : 'output-available',
          },
        ] satisfies ToolCallItem[])
      : []),
  ]

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
            {paths.groups.map((group) => {
              const Icon = dimensionIcons[group.key] ?? Target
              const isOpen = openGroups.includes(group.key)
              const panelId = `dim-${group.key}`
              const dims = group.dims.map(dimByKey).filter((dim) => dim !== undefined)
              const summary = group.dims.map(optionOf).join(' · ')
              return (
                <div className={isOpen ? 'dim__row is-open' : 'dim__row'} key={group.key}>
                  <button
                    type="button"
                    className="dim__toggle"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleGroup(group.key)}
                  >
                    <Icon className="dim__icon" aria-hidden="true" />
                    <span className="dim__toggle-label">{group.label}</span>
                    <span className="dim__toggle-value" key={summary}>
                      {summary}
                    </span>
                    <ChevronDown className="dim__chevron" aria-hidden="true" />
                  </button>
                  <div className="dim__panel" id={panelId} hidden={!isOpen}>
                    {dims.map((dim) => (
                      <div className="dim__part" key={dim.key}>
                        {dims.length > 1 ? (
                          <span className="dim__part-label">
                            {(() => {
                              const PartIcon = dimensionIcons[dim.key] ?? Target
                              return <PartIcon aria-hidden="true" />
                            })()}
                            {dim.label}
                          </span>
                        ) : null}
                        <ToggleGroup
                          type="single"
                          className="chips"
                          aria-label={dim.label}
                          value={String(selection[dim.key] ?? 0)}
                          onValueChange={(value) => {
                            if (!value) return
                            // The pick shows at once; the random walk carries on from it.
                            setSelection((current) => ({ ...current, [dim.key]: Number(value) }))
                            // Single-choice groups close so the path card is back in view.
                            if (dims.length === 1) setOpenGroups((current) => current.filter((item) => item !== group.key))
                          }}
                        >
                          {dim.options.map((option, index) => {
                            const ChipIcon = dim.key === 'env' ? envIcons[index] : undefined
                            return (
                              <ToggleGroupItem className="chip" value={String(index)} key={option}>
                                {ChipIcon ? <ChipIcon className="chip__icon" aria-hidden="true" /> : null}
                                {option}
                              </ToggleGroupItem>
                            )
                          })}
                        </ToggleGroup>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div ref={ref} {...hoverProps}>
            <Reveal delay={0.08}>
              <div className="focus-glow">
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
                    <Tag tone="coral" icon={<TriangleAlert aria-hidden="true" />}>{optionOf('competency')}</Tag>
                    <Tag tone="soft" icon={<MapPin aria-hidden="true" />}>{optionOf('env')}</Tag>
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
                    {/* Real work, shown as the agent's tasks: compose → search the library → match trainers. */}
                    <div className="builder__agent">
                      <AIToolCalls
                        key={composed}
                        calls={pathCalls}
                        answer={
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
                        }
                      />
                    </div>
                  </div>

                  <div className="builder__foot">
                    <span>
                      <CalendarClock aria-hidden="true" />
                      {paths.builder.note}
                    </span>
                    <span className="builder__count">
                      <Layers aria-hidden="true" /> {paths.groups.length} أبعاد
                    </span>
                  </div>
                </div>
              </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
