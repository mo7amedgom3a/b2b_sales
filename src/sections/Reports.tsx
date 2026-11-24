import NumberFlow from '@number-flow/react'
import {
  BarChart3,
  Blocks,
  BriefcaseBusiness,
  CircleCheckBig,
  FileText,
  Gauge,
  Handshake,
  Info,
  Keyboard,
  Lightbulb,
  Radar as RadarIcon,
  Route,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  TriangleAlert,
  Trophy,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { demoPeople, reports } from '../content/ar'
import type { DemoPerson } from '../content/ar'
import { useDemoSequence } from '../motion/useDemoSequence'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterChars } from '../motion/TypewriterText'
import { Reveal } from '../motion/Reveal'
import { Avatar } from '../ui/Avatar'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'
import { AnimateIcon, AnimatedAlert, AnimatedCheck } from '../ui/animated-icons'

const bulletIcons = [FileText, TrendingUp, Target, RadarIcon, Route, Blocks] as const

type Scene = (typeof reports.scenes)[number]
type View = Scene['view']

/** Which feature tile each dashboard view demonstrates (lit while it's on screen). */
const viewBullet: Record<View, number> = { top: 1, gaps: 3, profile: 2 }
const viewIcons: Record<View, LucideIcon> = { top: Trophy, gaps: RadarIcon, profile: UserRound }

/** Charts draw slowly enough to read as "the answer drawing itself". */
const CHART_ANIM = { isAnimationActive: true, animationDuration: 1300, animationEasing: 'ease-out' } as const
const GAP_LINE = 62
const TARGET = 70
const tick = { fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-body)' } as const

/** Team average per skill (same order as `reports.skills`). */
const teamSkills = reports.skills.map((label, index) => ({
  label,
  value: Math.round(demoPeople.reduce((sum, person) => sum + (person.values[index] ?? 0), 0) / demoPeople.length),
}))

const byActivity = [...demoPeople].sort((a, b) => b.hours - a.hours)

type Kpi = { label: string; value: number; suffix?: string; Icon: LucideIcon; tone: string; decimals?: number }

function teamKpis(): Kpi[] {
  const avg = (pick: (person: DemoPerson) => number) =>
    demoPeople.reduce((sum, person) => sum + pick(person), 0) / demoPeople.length
  return [
    { label: 'نسب الإكمال', value: Math.round(avg((p) => p.completion)), suffix: '%', Icon: CircleCheckBig, tone: 'green' },
    { label: 'متوسط التقييم', value: Math.round(avg((p) => p.score)), suffix: '%', Icon: Target, tone: 'sky' },
    { label: 'ساعات التدريب', value: Math.round(avg((p) => p.hours) * 10) / 10, Icon: Timer, tone: 'yellow', decimals: 1 },
    { label: 'فجوات تحتاج متابعة', value: teamSkills.filter((s) => s.value < GAP_LINE).length, Icon: TriangleAlert, tone: 'coral' },
  ]
}

function personKpis(person: DemoPerson): Kpi[] {
  return [
    { label: 'نسبة الإكمال', value: person.completion, suffix: '%', Icon: CircleCheckBig, tone: 'green' },
    { label: 'تقييم المحاكاة', value: person.score, suffix: '%', Icon: Target, tone: 'sky' },
    { label: 'ساعات التدريب', value: person.hours, Icon: Timer, tone: 'yellow', decimals: 1 },
    { label: 'أضعف جدارة', value: Math.min(...person.values), suffix: '%', Icon: TriangleAlert, tone: 'coral' },
  ]
}

/* ---------- الأكثر نشاطاً: hours (bars) + completion (line) ---------- */

const topConfig = {
  hours: { label: 'ساعات التدريب', color: 'var(--coral)' },
  completion: { label: 'نسبة الإكمال', color: 'var(--sky)' },
} satisfies ChartConfig

function TopView() {
  // Charts run LTR (as in the admin reports) so Arabic labels shape cleanly; reversed so #1 sits on the right.
  const data = [...byActivity].reverse().map((person) => ({ name: person.first, hours: person.hours, completion: person.completion }))
  return (
    <div className="rep-view">
      <div className="rep-view__head">
        <Trophy aria-hidden="true" /> أكثر 5 متدربين نشاطاً هذا الشهر
      </div>
      <ChartContainer
        config={topConfig}
        className="rep-chart"
        dir="ltr"
        aria-label={byActivity.map((p) => `${p.first}: ${p.hours} ساعة، إكمال ${p.completion}%`).join('، ')}
      >
        <ComposedChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 6" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={tick} tickMargin={10} />
          <YAxis yAxisId="h" hide domain={[0, 'dataMax + 4']} />
          <YAxis yAxisId="c" hide domain={[0, 110]} />
          <ChartTooltip cursor={{ fill: 'color-mix(in srgb, var(--text) 5%, transparent)' }} content={<ChartTooltipContent />} />
          <Legend verticalAlign="top" height={28} content={<ChartLegendContent />} />
          <Bar yAxisId="h" dataKey="hours" fill="var(--color-hours)" radius={[10, 10, 4, 4]} barSize={34} {...CHART_ANIM} />
          <Line
            yAxisId="c"
            dataKey="completion"
            type="monotone"
            stroke="var(--color-completion)"
            strokeWidth={3}
            dot={{ r: 4, fill: 'var(--surface)', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            {...CHART_ANIM}
            animationBegin={350}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}

/* ---------- الفجوات: team radar vs target ---------- */

const gapsConfig = {
  team: { label: 'متوسط الفريق', color: 'var(--coral)' },
  target: { label: 'المستهدف', color: 'var(--sky)' },
} satisfies ChartConfig

function GapsView() {
  const data = teamSkills.map((skill) => ({ name: skill.label, team: skill.value, target: TARGET }))
  const weakest = [...teamSkills].sort((a, b) => a.value - b.value)[0]
  return (
    <div className="rep-view">
      <div className="rep-view__head">
        <RadarIcon aria-hidden="true" /> فجوات المهارات: متوسط الفريق مقابل المستهدف
      </div>
      <div className="rep-split">
        <ChartContainer config={gapsConfig} className="rep-chart rep-chart--radar" dir="ltr" aria-label={teamSkills.map((s) => `${s.label} ${s.value}%`).join('، ')}>
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={tick} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar dataKey="target" stroke="var(--color-target)" strokeDasharray="5 5" fill="none" strokeWidth={2} {...CHART_ANIM} />
            <Radar dataKey="team" stroke="var(--color-team)" fill="var(--color-team)" fillOpacity={0.28} strokeWidth={2.5} {...CHART_ANIM} animationBegin={250} />
          </RadarChart>
        </ChartContainer>
        <ul className="rep-skills">
          {[...teamSkills].sort((a, b) => a.value - b.value).map((skill, index) => {
            const gap = skill.value < GAP_LINE
            return (
              <li className={gap ? 'rep-skill is-gap' : 'rep-skill'} key={skill.label} style={{ animationDelay: `${index * 70}ms` }}>
                <span className="rep-skill__icon">
                  <AnimateIcon loop={2600} loopDelay={index * 200} animateOnHover={false}>
                    {gap ? <AnimatedAlert size={15} /> : <AnimatedCheck size={15} />}
                  </AnimateIcon>
                </span>
                <span className="rep-skill__name">{skill.label}</span>
                <b dir="ltr">{skill.value}%</b>
                <span className="rep-skill__track">
                  <span className="rep-skill__fill" style={{ width: `${skill.value}%`, animationDelay: `${index * 90}ms` }} />
                </span>
              </li>
            )
          })}
        </ul>
      </div>
      {weakest ? (
        <p className="rep-view__note">
          <Lightbulb aria-hidden="true" /> الخطوة التالية: مسار «{weakest.label}» لكل الفريق خلال أسبوعين.
        </p>
      ) : null}
    </div>
  )
}

/* ---------- الملف المهاري: person vs team ---------- */

const profileConfig = {
  person: { label: 'الموظف', color: 'var(--coral)' },
  team: { label: 'متوسط الفريق', color: 'var(--text-muted)' },
} satisfies ChartConfig

function ProfileView({ person }: { person: DemoPerson }) {
  const data = reports.skills.map((skill, index) => ({
    name: skill,
    person: person.values[index] ?? 0,
    team: teamSkills[index]?.value ?? 0,
  }))
  return (
    <div className="rep-view">
      <div className="rep-profile">
        <Avatar initial={person.initial} tone={person.tone} size={44} />
        <div className="rep-profile__who">
          <b>{person.name}</b>
          <span>
            <BriefcaseBusiness aria-hidden="true" /> {person.role}
          </span>
        </div>
        <Tag tone="coral" icon={<Gauge aria-hidden="true" />}>{person.score}%</Tag>
      </div>
      <div className="rep-split">
        <ChartContainer
          config={{ ...profileConfig, person: { ...profileConfig.person, label: person.first } }}
          className="rep-chart rep-chart--radar"
          dir="ltr"
          aria-label={`ملف ${person.name} المهاري`}
        >
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={tick} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar dataKey="team" stroke="var(--color-team)" strokeDasharray="4 4" fill="none" strokeWidth={1.5} {...CHART_ANIM} />
            <Radar dataKey="person" stroke="var(--color-person)" fill="var(--color-person)" fillOpacity={0.3} strokeWidth={2.5} {...CHART_ANIM} animationBegin={250} />
          </RadarChart>
        </ChartContainer>
        <ul className="rep-chips">
          {data.map((skill, index) => {
            const gap = skill.person < GAP_LINE
            const diff = skill.person - skill.team
            return (
              <li className={gap ? 'rep-chip is-gap' : 'rep-chip'} key={skill.name} style={{ animationDelay: `${index * 60}ms` }}>
                <span className="rep-chip__name">{skill.name}</span>
                <b dir="ltr">{skill.person}%</b>
                <span className={diff >= 0 ? 'rep-chip__diff is-up' : 'rep-chip__diff is-down'} dir="ltr">
                  {diff >= 0 ? '+' : ''}
                  {diff}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function SceneView({ scene }: { scene: Scene }) {
  if (scene.view === 'gaps') return <GapsView />
  if (scene.view === 'profile') {
    const person = demoPeople.find((item) => item.id === scene.personId) ?? demoPeople[0]
    return <ProfileView person={person} />
  }
  return <TopView />
}

function sceneLabel(scene: Scene) {
  if (scene.view === 'top') return 'الأكثر نشاطاً'
  if (scene.view === 'gaps') return 'الفجوات'
  const person = demoPeople.find((item) => item.id === scene.personId)
  return `ملف ${person?.first ?? ''}`
}

const scenePrompts = reports.scenes.map((scene) => scene.prompt)

export function Reports() {
  const reduce = useReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.25 })
  // Same snappy rhythm as the demo section.
  const demo = useDemoSequence(scenePrompts, {
    paused,
    typeMs: 40,
    jitterMs: [26, 58],
    workingMs: 380,
    clearMs: 220,
    showMs: 6200,
  })
  const scene = reports.scenes[demo.step] ?? reports.scenes[0]
  const person = scene.view === 'profile' ? demoPeople.find((item) => item.id === scene.personId) : undefined
  const kpis = person ? personKpis(person) : teamKpis()
  const litBullet = viewBullet[scene.view]

  return (
    <section className="section section--band reports" id="reports">
      <div className="ma-container" ref={ref}>
        <SecHead index="08" title={reports.title} lead={reports.lead} icon={BarChart3} />

        <div className="rep-grid">
          <Reveal delay={0.04}>
            <div className="focus-glow">
              <div className="rep-dash" {...hoverProps}>
                {/* Scene switcher: same sliding rail as the demo section */}
                <div className="demo-rail-wrap">
                  <div className="demo-rail" role="tablist" aria-label="أمثلة على الأسئلة">
                    {reports.scenes.map((item, index) => {
                      const Icon = viewIcons[item.view]
                      const active = index === demo.step
                      return (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={active}
                          className={active ? 'demo-rail__item is-active' : 'demo-rail__item'}
                          key={item.prompt}
                          onClick={() => demo.goTo(index)}
                        >
                          {active ? (
                            <motion.span
                              layoutId="reports-rail-glider"
                              className="demo-rail__glider"
                              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                              aria-hidden="true"
                            >
                              <span className="demo-rail__timer" key={demo.resultKey} />
                            </motion.span>
                          ) : null}
                          <span className="demo-rail__icon">
                            <Icon aria-hidden="true" />
                          </span>
                          <span className="demo-rail__label">{sceneLabel(item)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rep-query">
                  <Sparkles aria-hidden="true" />
                  <TypewriterChars text={demo.text} ghosts={demo.ghosts} caret={demo.phase === 'typing'} phase={demo.typePhase} />
                  <span className="sr-only" aria-live="polite">
                    {demo.resultVisible ? scene.prompt : ''}
                  </span>
                </div>

                <div className="rep-kpis">
                  {kpis.map((kpi) => (
                    <div className={`rep-kpi rep-kpi--${kpi.tone}`} key={kpi.label}>
                      <span className="rep-kpi__icon">
                        <kpi.Icon aria-hidden="true" />
                      </span>
                      <b dir="ltr">
                        <NumberFlow
                          value={kpi.value}
                          locales="en-US"
                          format={{ maximumFractionDigits: kpi.decimals ?? 0, minimumFractionDigits: kpi.decimals ?? 0 }}
                          suffix={kpi.suffix}
                          animated={!reduce}
                        />
                      </b>
                      <span className="rep-kpi__label">{kpi.label}</span>
                    </div>
                  ))}
                </div>

                <div className="rep-stage">
                  <AnimatePresence mode="wait" initial={false}>
                    {demo.resultVisible ? (
                      <motion.div
                        key={demo.resultKey}
                        initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={reduce ? undefined : { opacity: 0, y: -10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <SceneView scene={scene} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="loading"
                        className="rep-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        aria-hidden="true"
                      >
                        <span className="rep-loading__label">
                          {demo.phase === 'working' ? (
                            <>
                              <span className="pulse" /> جارٍ تحليل بيانات الفريق…
                            </>
                          ) : (
                            <>
                              <Keyboard /> يكتب السؤال…
                            </>
                          )}
                        </span>
                        <Skeleton className="rep-loading__bar" />
                        <Skeleton className="rep-loading__bar" />
                        <Skeleton className="rep-loading__bar" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <p className="rep-note">
                  <Info aria-hidden="true" /> {reports.demoLabel}: البيانات لا تمثل عميلاً حقيقياً.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <ul className="rep-features">
              {reports.bullets.map(([title, body], index) => {
                const Icon = bulletIcons[index] ?? FileText
                const lit = index === litBullet
                return (
                  <li className={lit ? 'rep-feature is-lit' : 'rep-feature'} key={title}>
                    <span className="rep-feature__icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <b className="rep-feature__title">{title}</b>
                    <p className="rep-feature__body">{body}</p>
                  </li>
                )
              })}
            </ul>
            <p className="rep-advisor">
              <Handshake aria-hidden="true" />
              {reports.note}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
