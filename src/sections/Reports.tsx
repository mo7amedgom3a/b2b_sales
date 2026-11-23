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
  LayoutDashboard,
  Lightbulb,
  Radar as RadarIcon,
  Route,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  TriangleAlert,
  Trophy,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { demoPeople, reports } from '../content/ar'
import type { DemoPerson } from '../content/ar'
import { formatNumber } from '../lib/format'
import { useDemoSequence } from '../motion/useDemoSequence'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterChars } from '../motion/TypewriterText'
import { Reveal } from '../motion/Reveal'
import { Avatar } from '../ui/Avatar'
import { ChartContainer, kitColor } from '../ui/chart'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const bulletIcons = [FileText, TrendingUp, Target, RadarIcon, Route, Sparkles, Blocks] as const

const radarConfig = { value: { label: 'المستوى', color: kitColor('coral') } } as const

type Scene = (typeof reports.scenes)[number]

/** Team average per skill (same order as `reports.skills`). */
const teamSkills = reports.skills.map((label, index) => ({
  label,
  value: Math.round(demoPeople.reduce((sum, person) => sum + (person.values[index] ?? 0), 0) / demoPeople.length),
}))

const byActivity = [...demoPeople].sort((a, b) => b.hours - a.hours)

function teamKpis() {
  const avg = (pick: (person: DemoPerson) => number) =>
    demoPeople.reduce((sum, person) => sum + pick(person), 0) / demoPeople.length
  const gaps = teamSkills.filter((skill) => skill.value < 62).length
  return [
    { label: 'نسب الإكمال', value: `${Math.round(avg((p) => p.completion))}%`, Icon: CircleCheckBig },
    { label: 'متوسط التقييم', value: `${Math.round(avg((p) => p.score))}%`, Icon: Target },
    { label: 'ساعات التدريب', value: formatNumber(Math.round(avg((p) => p.hours) * 10) / 10), Icon: Timer },
    { label: 'فجوات تحتاج متابعة', value: String(gaps), Icon: TriangleAlert },
  ]
}

function personKpis(person: DemoPerson) {
  const weakest = Math.min(...person.values)
  return [
    { label: 'نسبة الإكمال', value: `${person.completion}%`, Icon: CircleCheckBig },
    { label: 'تقييم المحاكاة', value: `${person.score}%`, Icon: Target },
    { label: 'ساعات التدريب', value: formatNumber(person.hours), Icon: Timer },
    { label: 'أضعف جدارة', value: `${weakest}%`, Icon: TriangleAlert },
  ]
}

function EmployeeRadar({ person, paused }: { person: DemoPerson; paused: boolean }) {
  const data = reports.skills.map((skill, index) => ({ name: skill, value: person.values[index] ?? 0 }))
  return (
    <ChartContainer config={radarConfig} height={170} aria-label={`ملف ${person.name} المهاري`}>
      <RadarChart data={data} outerRadius="68%">
        <PolarGrid />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
        <Radar
          dataKey="value"
          stroke="var(--coral)"
          fill="var(--coral)"
          fillOpacity={0.26}
          isAnimationActive={!paused}
          animationDuration={850}
        />
      </RadarChart>
    </ChartContainer>
  )
}

function TopView() {
  return (
    <div className="dash__view">
      <div className="dash__view-head">
        <Trophy aria-hidden="true" /> أكثر 5 متدربين نشاطاً — هذا الشهر
      </div>
      <Table className="dash__table">
        <TableHeader>
          <TableRow>
            <TableHead>المتدرب</TableHead>
            <TableHead>ساعات</TableHead>
            <TableHead>إكمال</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {byActivity.map((person, index) => (
            <TableRow key={person.id} style={{ animationDelay: `${index * 70}ms` }}>
              <TableCell>
                <span className="dash__person">
                  <span className="dash__rank">{index + 1}</span>
                  <Avatar initial={person.initial} tone={person.tone} size={22} />
                  {person.name}
                </span>
              </TableCell>
              <TableCell dir="ltr">{formatNumber(person.hours)}</TableCell>
              <TableCell>
                <span className="dash__cell-bar">
                  <span className="dash__cell-track">
                    <span className="dash__cell-fill" style={{ width: `${person.completion}%` }} />
                  </span>
                  <b dir="ltr">{person.completion}%</b>
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function GapsView() {
  const sorted = [...teamSkills].sort((a, b) => a.value - b.value)
  return (
    <div className="dash__view">
      <div className="dash__view-head">
        <RadarIcon aria-hidden="true" /> فجوات المهارات — متوسط الفريق
      </div>
      <div className="dash__bars">
        {sorted.map((skill, index) => {
          const gap = skill.value < 62
          return (
            <div className={gap ? 'dash__bar-row is-gap' : 'dash__bar-row'} key={skill.label}>
              <span>
                {gap ? <TriangleAlert aria-hidden="true" /> : <CircleCheckBig aria-hidden="true" />}
                {skill.label}
              </span>
              <span className="dash__track">
                <span className="dash__fill" style={{ width: `${skill.value}%`, animationDelay: `${index * 90}ms` }} />
              </span>
              <b dir="ltr">{skill.value}%</b>
            </div>
          )
        })}
      </div>
      <p className="dash__view-note">
        <Lightbulb aria-hidden="true" /> الخطوة التالية: مسار «{sorted[0]?.label}» لكل الفريق خلال أسبوعين.
      </p>
    </div>
  )
}

function ProfileView({ person, paused }: { person: DemoPerson; paused: boolean }) {
  return (
    <div className="dash__view dash__profile">
      <div className="dash__profile-card">
        <Avatar initial={person.initial} tone={person.tone} size={40} />
        <div>
          <b>{person.name}</b>
          <span>
            <BriefcaseBusiness aria-hidden="true" /> {person.role}
          </span>
        </div>
        <Tag tone="coral" icon={<Gauge aria-hidden="true" />}>{person.score}%</Tag>
      </div>
      <div className="dash__radar">
        <div className="dash__radar-chart">
          <div className="chart-panel__head">
            <span className="chart-panel__title">
              <RadarIcon size={12} aria-hidden="true" /> ملف {person.name} المهاري
            </span>
          </div>
          <EmployeeRadar person={person} paused={paused} />
        </div>
        <Table className="dash__table dash__table--skills">
          <TableBody>
            {reports.skills.map((skill, index) => {
              const value = person.values[index] ?? 0
              return (
                <TableRow key={skill} style={{ animationDelay: `${index * 60}ms` }}>
                  <TableCell>{skill}</TableCell>
                  <TableCell dir="ltr">{value}%</TableCell>
                  <TableCell>
                    {value < 62 ? (
                      <Tag tone="coral" icon={<TriangleAlert aria-hidden="true" />}>فجوة</Tag>
                    ) : (
                      <Tag tone="green" icon={<CircleCheckBig aria-hidden="true" />}>جيد</Tag>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function SceneView({ scene, paused }: { scene: Scene; paused: boolean }) {
  if (scene.view === 'gaps') return <GapsView />
  if (scene.view === 'profile') {
    const person = demoPeople.find((item) => item.id === scene.personId) ?? demoPeople[0]
    return <ProfileView person={person} paused={paused} />
  }
  return <TopView />
}

function ReportSpotlight() {
  const reduce = useReducedMotion()
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.3 })
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduce || paused) return
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % reports.bullets.length)
    }, 3600)
    return () => window.clearInterval(timer)
  }, [reduce, paused, active])

  const [title, body] = reports.bullets[active] ?? reports.bullets[0]
  const Icon = bulletIcons[active] ?? FileText

  return (
    <div className="spot" ref={ref}>
      <ToggleGroup
        type="single"
        className="spot__chips"
        aria-label="مزايا لوحة المتابعة"
        value={String(active)}
        onValueChange={(value) => {
          if (!value) return
          setActive(Number(value))
        }}
      >
        {reports.bullets.map(([itemTitle], index) => {
          const ChipIcon = bulletIcons[index] ?? FileText
          return (
            <ToggleGroupItem className="spot__chip" value={String(index)} key={itemTitle} showCheck={false}>
              <ChipIcon aria-hidden="true" />
              {itemTitle}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
      <div className="spot__body is-enter" key={active} aria-live="polite">
        <h4>
          <Icon aria-hidden="true" />
          {title}
        </h4>
        <p>{body}</p>
      </div>
    </div>
  )
}

const scenePrompts = reports.scenes.map((scene) => scene.prompt)
const profileScenes = reports.scenes
  .map((scene, index) => ({ scene, index }))
  .filter(({ scene }) => scene.view === 'profile')

export function Reports() {
  const reduce = useReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.25 })
  const demo = useDemoSequence(scenePrompts, { paused, workingMs: 700, showMs: 5400, jitterMs: [34, 68] })
  const scene = reports.scenes[demo.step] ?? reports.scenes[0]
  const person = scene.view === 'profile' ? demoPeople.find((item) => item.id === scene.personId) : undefined
  const kpis = person ? personKpis(person) : teamKpis()

  return (
    <section className="section section--band reports" id="reports">
      <div className="ma-container" ref={ref}>
        <SecHead index="08" title={reports.title} lead={reports.lead} icon={BarChart3} />

        <div className="reports__grid">
          <Reveal>
            <div className="reports__list">
              {reports.bullets.map(([title, body], index) => {
                const Icon = bulletIcons[index] ?? FileText
                return (
                  <div className="report-item" key={title}>
                    <span className="report-item__icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <p>
                      <b>{title}:</b> {body}
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="reports__note">
              <Handshake aria-hidden="true" />
              {reports.note}
            </p>
            <ReportSpotlight />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="dash" {...hoverProps}>
              <div className="dash__top">
                <span className="dash__title">
                  <LayoutDashboard aria-hidden="true" /> لوحة متابعة الفريق
                </span>
                <Tag tone="soft" icon={<Info aria-hidden="true" />}>{reports.demoLabel}</Tag>
              </div>

              <div className="dash__query">
                <Sparkles aria-hidden="true" />
                <TypewriterChars
                  text={demo.text}
                  ghosts={demo.ghosts}
                  caret={demo.phase === 'typing'}
                  phase={demo.typePhase}
                />
                <span className="sr-only" aria-live="polite">
                  {demo.resultVisible ? scene.prompt : ''}
                </span>
              </div>

              <div className="dash__scenes" role="group" aria-label="أمثلة على الأسئلة">
                {reports.scenes.map((item, index) => (
                  <button
                    type="button"
                    className="dash__scene-dot"
                    key={item.prompt}
                    aria-label={item.prompt}
                    aria-pressed={index === demo.step}
                    onClick={() => demo.goTo(index)}
                  />
                ))}
              </div>

              <div className="dash__body">
                <div className="dash__kpis" key={person?.id ?? 'team'}>
                  {kpis.map((kpi, index) => (
                    <div className="dash__kpi" key={kpi.label} style={{ animationDelay: `${index * 60}ms` }}>
                      <kpi.Icon className="dash__kpi-icon" aria-hidden="true" />
                      <b dir="ltr">{kpi.value}</b>
                      <span>{kpi.label}</span>
                    </div>
                  ))}
                </div>

                <div className="dash__stage">
                  <AnimatePresence mode="wait" initial={false}>
                    {demo.resultVisible ? (
                      <motion.div
                        key={demo.resultKey}
                        initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={reduce ? undefined : { opacity: 0, y: -10, filter: 'blur(4px)' }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <SceneView scene={scene} paused={paused} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="loading"
                        className={demo.phase === 'working' ? 'dash__loading is-working' : 'dash__loading'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        aria-hidden="true"
                      >
                        <span className="dash__loading-label">
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
                        <Skeleton className="dash__loading-bar" />
                        <Skeleton className="dash__loading-bar" />
                        <Skeleton className="dash__loading-bar" />
                        <Skeleton className="dash__loading-bar" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {profileScenes.length > 0 ? (
                  <ToggleGroup
                    type="single"
                    className="dash__people"
                    aria-label="اعرض ملف موظف"
                    value={scene.view === 'profile' ? String(demo.step) : ''}
                    onValueChange={(value) => {
                      if (value) demo.goTo(Number(value))
                    }}
                  >
                    {profileScenes.map(({ scene: item, index }) => {
                      const chipPerson = demoPeople.find((p) => p.id === item.personId) ?? demoPeople[0]
                      return (
                        <ToggleGroupItem className="dash__person-chip" value={String(index)} key={item.prompt}>
                          <Avatar initial={chipPerson.initial} tone={chipPerson.tone} size={18} />
                          ملف {chipPerson.first}
                        </ToggleGroupItem>
                      )
                    })}
                  </ToggleGroup>
                ) : null}

                <p className="dash__note">
                  <Info size={11} aria-hidden="true" /> مثال توضيحي — البيانات لا تمثل عميلاً حقيقياً.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
