import {
  Activity,
  Bot,
  CalendarDays,
  Flame,
  Gauge,
  GraduationCap,
  MousePointerClick,
  Radio,
  RefreshCw,
  Route,
  Search,
  SendHorizontal,
  Sparkles,
  Stethoscope,
  Target,
  Timer,
  UsersRound,
  Video,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import type { ToolCallItem } from '@/components/kokonutui/ai-tool-calls'
import { demoPeople, heroDemoSteps } from '../../content/ar'
import type { HeroDemoKind } from '../../content/ar'
import { useDemoCourses } from '../../lib/demoCourses'
import type { DemoCourse } from '../../lib/demoCourses'
import { formatNumber } from '../../lib/format'
import { useInViewAutoplay } from '../../motion/useInViewAutoplay'
import { TypewriterChars } from '../../motion/TypewriterText'
import { useDemoSequence } from '../../motion/useDemoSequence'
import { Avatar } from '../../ui/Avatar'
import { AgentRun, agentRunMs } from '../../ui/AgentRun'
import { Tag } from '../../ui/Tag'
import { AnimateIcon, AnimatedAlert, AnimatedCheck, AnimatedMinus } from '../../ui/animated-icons'

const prompts = heroDemoSteps.map((step) => step.prompt)

const stepIcons: Record<HeroDemoKind, LucideIcon> = {
  gaps: Stethoscope,
  path: Route,
  training: GraduationCap,
  sim: Bot,
  dash: Gauge,
}

/** Chart animations: slow enough to read as "the answer drawing itself". */
const CHART_ANIM = { isAnimationActive: true, animationDuration: 1300, animationEasing: 'ease-out' } as const
/** Every looping icon replays on the same beat as the charts. */
const ICON_LOOP = 2600

const axisTick = { fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-body)' } as const

/* ---------- تشخيص: team level per skill (bar chart) + who has the gap ---------- */

const skillScores = [
  { skill: 'التنقيب', score: 71, tone: 'good' },
  { skill: 'الإقناع', score: 64, tone: 'mid' },
  { skill: 'الاعتراضات', score: 41, tone: 'gap' },
  { skill: 'الإغلاق', score: 58, tone: 'mid' },
] as const

const toneColor = { good: 'var(--green)', mid: 'var(--yellow)', gap: 'var(--coral)' } as const

const gapPeople = [
  { person: demoPeople[0], status: 'gap' },
  { person: demoPeople[1], status: 'gap' },
  { person: demoPeople[2], status: 'mid' },
  { person: demoPeople[3], status: 'good' },
] as const

const gapsConfig = { score: { label: 'مستوى الفريق' } } satisfies ChartConfig

function StatusIcon({ status, delay }: { status: 'gap' | 'mid' | 'good'; delay: number }) {
  return (
    <AnimateIcon loop={ICON_LOOP} loopDelay={delay} animateOnHover={false}>
      {status === 'gap' ? <AnimatedAlert size={16} /> : status === 'mid' ? <AnimatedMinus size={16} /> : <AnimatedCheck size={16} />}
    </AnimateIcon>
  )
}

function GapsResult() {
  return (
    <div className="dres">
      <div className="dres__head">
        <span className="dres__title">مستوى فريق المبيعات في كل مهارة</span>
        <Tag tone="coral">الفجوة: إدارة الاعتراضات</Tag>
      </div>
      <div className="dres__split">
        <ChartContainer config={gapsConfig} className="dres__chart" aria-label="مستوى الفريق: التنقيب 71، الإقناع 64، الاعتراضات 41، الإغلاق 58">
          <BarChart data={[...skillScores]} margin={{ top: 26, right: 8, left: 8, bottom: 0 }} barCategoryGap="22%">
            <XAxis dataKey="skill" reversed tickLine={false} axisLine={false} tick={axisTick} tickMargin={10} />
            <YAxis hide domain={[0, 100]} />
            <Bar dataKey="score" radius={[10, 10, 4, 4]} {...CHART_ANIM}>
              {skillScores.map((item) => (
                <Cell key={item.skill} fill={toneColor[item.tone]} />
              ))}
              <LabelList dataKey="score" position="top" offset={8} className="dres__bar-label" formatter={(value) => `${value}%`} />
            </Bar>
          </BarChart>
        </ChartContainer>
        <ul className="dres-people">
          {gapPeople.map(({ person, status }, index) => (
            <li className={`dres-people__item dres-people__item--${status}`} key={person.id} style={{ animationDelay: `${120 + index * 70}ms` }}>
              <Avatar initial={person.initial} tone={person.tone} size={34} />
              <span className="dres-people__body">
                <b>{person.first}</b>
                <span>{status === 'gap' ? 'فجوة في الاعتراضات' : status === 'mid' ? 'يحتاج تدريباً' : 'جدارة قوية'}</span>
              </span>
              <span className="dres-people__icon">
                <StatusIcon status={status} delay={index * 220} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- مسار: four modules as connected columns ---------- */

const fallbackModules = [
  { name: 'فهم اعتراضات التأمين', meta: 'الأسبوع 1', done: true },
  { name: 'التفاوض على الشروط', meta: 'الأسبوع 2', done: true },
  { name: 'محاكاة مع كوتش AI', meta: 'الأسبوع 3', done: false },
  { name: 'تطبيق على صفقة حقيقية', meta: 'الأسبوع 4', done: false },
] as const

const moduleIcons: LucideIcon[] = [Target, UsersRound, Bot, Flame]

function toModules(courses: DemoCourse[]) {
  if (courses.length < 4) return fallbackModules
  return courses.slice(0, 4).map((course, index) => ({
    name: course.title,
    meta: `الأسبوع ${index + 1} · ${formatNumber(course.lessons)} درساً`,
    done: index < 2,
  }))
}

function PathResult({ courses }: { courses: DemoCourse[] }) {
  const modules = toModules(courses)
  return (
    <div className="dres">
      <div className="dres__head">
        <span className="dres__title">مسار: موظف مبيعات تأمين ميداني</span>
        <Tag tone="sky">4 أسابيع</Tag>
      </div>
      <ol className="dres-steps">
        {modules.map((module, index) => {
          const Icon = moduleIcons[index] ?? Target
          return (
            <li
              className={module.done ? 'dres-step is-done' : 'dres-step'}
              key={module.name}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <span className="dres-step__icon">
                <Icon aria-hidden="true" />
              </span>
              <span className="dres-step__meta">{module.meta}</span>
              <span className="dres-step__name">{module.name}</span>
              <span className="dres-step__state">
                {module.done ? (
                  <AnimateIcon loop={ICON_LOOP} loopDelay={index * 260} animateOnHover={false}>
                    <AnimatedCheck size={14} />
                  </AnimateIcon>
                ) : (
                  <span className="dres-step__dot" aria-hidden="true" />
                )}
                {module.done ? 'مكتمل' : 'قادم'}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="dres__foot">
        <Sparkles aria-hidden="true" /> مبني على فجوة الاعتراضات وقطاع التأمين
      </p>
    </div>
  )
}

/* ---------- التدريب: three formats as cards, each with a radial progress ---------- */

const fallbackFormats = [
  { icon: Video, name: 'الدرس 12: إدارة الاعتراضات', meta: 'اليوم · 12 دقيقة', progress: 60, tone: 'coral' },
  { icon: Bot, name: 'محاكاة يومية مع كوتش AI', meta: 'سلسلة 12 يوماً', progress: 35, tone: 'yellow' },
  { icon: Radio, name: 'بث مباشر: تفاوض متقدم', meta: 'الخميس · 60 دقيقة', progress: 8, tone: 'sky' },
] as const

function toFormats(courses: DemoCourse[]) {
  if (courses.length < 3) return fallbackFormats
  return fallbackFormats.map((format, index) =>
    index === 0 ? { ...format, name: courses[0]?.title ?? format.name } : format,
  )
}

function RadialProgress({ value, tone, label }: { value: number; tone: string; label: string }) {
  const config = { value: { label, color: `var(--${tone})` } } satisfies ChartConfig
  return (
    <ChartContainer config={config} className="dres-ring" aria-label={`${label}: ${value}%`}>
      <RadialBarChart data={[{ value }]} startAngle={90} endAngle={-270} innerRadius="74%" outerRadius="100%">
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
        <RadialBar dataKey="value" cornerRadius={20} fill="var(--color-value)" background={{ fill: 'var(--fill-soft, rgba(23,22,27,.08))' }} {...CHART_ANIM} />
      </RadialBarChart>
    </ChartContainer>
  )
}

function TrainResult({ courses }: { courses: DemoCourse[] }) {
  const formats = toFormats(courses)
  return (
    <div className="dres">
      <div className="dres__head">
        <span className="dres__title">خطة تدريب الأسبوع</span>
        <Tag tone="green">15 دقيقة يومياً</Tag>
      </div>
      <div className="dres-cards">
        {formats.map((format, index) => {
          const Icon = format.icon
          return (
            <article className="dres-card" key={format.name} style={{ animationDelay: `${index * 90}ms` }}>
              <div className="dres-card__visual">
                <RadialProgress value={format.progress} tone={format.tone} label={format.name} />
                <span className={`dres-card__icon dres-card__icon--${format.tone}`}>
                  <Icon aria-hidden="true" />
                </span>
              </div>
              <b className="dres-card__name">{format.name}</b>
              <span className="dres-card__meta">{format.meta}</span>
              <span className="dres-card__pct">{formatNumber(format.progress)}%</span>
            </article>
          )
        })}
      </div>
      <p className="dres__foot">
        <RefreshCw aria-hidden="true" /> تتحدث الخطة أسبوعياً حسب تشخيص الفريق
      </p>
    </div>
  )
}

/* ---------- كوتش: the exchange + a radial score ---------- */

function SimResult() {
  const config = { score: { label: 'أداء المحاكاة', color: 'var(--green)' } } satisfies ChartConfig
  return (
    <div className="dres">
      <div className="dres__head">
        <span className="dres__title">محاكاة: اعتراض السعر</span>
        <Tag tone="green">تقييم فوري</Tag>
      </div>
      <div className="dres__split dres__split--sim">
        <div className="dres-chat">
          <span className="bubble bubble--bot">العميل: السعر أعلى من الميزانية، لماذا أدفع أكثر؟</span>
          <span className="bubble bubble--user">أحمد: أتفهم ذلك. دعنا نقارن تكلفة التأخير بقيمة الحل…</span>
          <span className="bubble bubble--coach">كوتش: جيد جداً. وضّح العائد قبل عرض الخصم.</span>
        </div>
        <div className="dres-score">
          <div className="dres-score__ring">
            <ChartContainer config={config} className="dres-ring dres-ring--lg" aria-label="أداء المحاكاة 82 من 100">
              <RadialBarChart data={[{ score: 82 }]} startAngle={90} endAngle={-270} innerRadius="78%" outerRadius="100%">
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
                <RadialBar dataKey="score" cornerRadius={20} fill="var(--color-score)" background={{ fill: 'var(--fill-soft, rgba(23,22,27,.08))' }} {...CHART_ANIM} />
              </RadialBarChart>
            </ChartContainer>
            <span className="dres-score__num">82</span>
          </div>
          <b>أداء المحاكاة</b>
          <div className="dres-score__chips">
            <Tag tone="green">وضوح القيمة</Tag>
            <Tag tone="yellow">الإغلاق</Tag>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------- لوحة المؤشرات: training hours per person (horizontal bars) ---------- */

const dashConfig = { hours: { label: 'ساعات التدريب', color: 'var(--coral)' } } satisfies ChartConfig

function DashResult() {
  const rows = [...demoPeople]
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5)
    .map((person) => ({ name: person.first, hours: person.hours }))
  return (
    <div className="dres">
      <div className="dres__head">
        <span className="dres__title">
          <UsersRound aria-hidden="true" /> أكثر 5 موظفي مبيعات نشاطاً
        </span>
        <Tag tone="yellow" icon={<CalendarDays aria-hidden="true" />}>هذا الشهر</Tag>
      </div>
      <ChartContainer
        config={dashConfig}
        className="dres__chart dres__chart--wide"
        aria-label={rows.map((row) => `${row.name} ${row.hours} ساعة`).join('، ')}
      >
        <BarChart data={rows} margin={{ top: 28, right: 8, left: 8, bottom: 0 }} barCategoryGap="20%">
          <XAxis dataKey="name" reversed tickLine={false} axisLine={false} tick={{ ...axisTick, fontSize: 13 }} tickMargin={10} />
          <YAxis hide domain={[0, 'dataMax + 2']} />
          <Bar dataKey="hours" radius={[10, 10, 4, 4]} {...CHART_ANIM}>
            {rows.map((row, index) => (
              <Cell key={row.name} fill={index === 0 ? 'var(--coral)' : 'color-mix(in srgb, var(--coral) 50%, var(--surface))'} />
            ))}
            <LabelList dataKey="hours" position="top" offset={8} className="dres__bar-label" formatter={(value) => `${value} س`} />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="dres__foot">
        <Activity aria-hidden="true" /> مرتّبون حسب ساعات التدريب خلال آخر 30 يوماً
      </p>
    </div>
  )
}

function Result({ kind, courses }: { kind: HeroDemoKind; courses: DemoCourse[] }) {
  if (kind === 'gaps') return <GapsResult />
  if (kind === 'path') return <PathResult courses={courses} />
  if (kind === 'training') return <TrainResult courses={courses} />
  if (kind === 'sim') return <SimResult />
  return <DashResult />
}

/* ---------- The agent's tasks per step (shown instead of a loader) ---------- */

const ic = (Icon: LucideIcon) => <Icon aria-hidden="true" />

const stepCalls: Record<HeroDemoKind, ToolCallItem[]> = {
  gaps: [
    { id: 'team', tool: 'read_team', icon: ic(UsersRound), tone: 'sky', running: 'يقرأ بيانات الفريق', done: 'قرأ بيانات الفريق', detail: '5 موظفين', result: '48 محاكاة', duration: 850 },
    { id: 'score', tool: 'score_skills', icon: ic(Gauge), tone: 'lilac', running: 'يقيس المهارات', done: 'قاس المهارات', detail: '4 مهارات', result: 'فجوتان', duration: 950 },
    { id: 'rank', tool: 'rank_gaps', icon: ic(Stethoscope), tone: 'coral', running: 'يرتّب الأولويات', done: 'رتّب الأولويات', result: 'الاعتراضات أولاً', duration: 800 },
  ],
  path: [
    { id: 'lib', tool: 'search_library', icon: ic(Search), tone: 'sky', running: 'يبحث في المكتبة', done: 'بحث في المكتبة', detail: '188 دورة', result: '12 مطابقة', duration: 900 },
    { id: 'gap', tool: 'match_gap', icon: ic(Target), tone: 'lilac', running: 'يطابقها مع الفجوة', done: 'طابقها مع الفجوة', detail: 'الاعتراضات · تأمين', result: '4 دورات', duration: 900 },
    { id: 'plan', tool: 'build_path', icon: ic(Route), tone: 'coral', running: 'يبني المسار', done: 'بنى المسار', result: '4 أسابيع', duration: 850 },
  ],
  training: [
    { id: 'gaps', tool: 'read_gaps', icon: ic(Stethoscope), tone: 'sky', running: 'يقرأ فجوات الفريق', done: 'قرأ فجوات الفريق', result: 'فجوتان', duration: 800 },
    { id: 'lessons', tool: 'pick_lessons', icon: ic(Video), tone: 'lilac', running: 'يختار الدروس', done: 'اختار الدروس', detail: '15 دقيقة يومياً', result: '5 دروس', duration: 900 },
    { id: 'live', tool: 'book_live', icon: ic(CalendarDays), tone: 'coral', running: 'يحجز البث المباشر', done: 'حجز البث المباشر', result: 'الخميس', duration: 900 },
  ],
  sim: [
    { id: 'scenario', tool: 'load_scenario', icon: ic(Bot), tone: 'sky', running: 'يجهّز السيناريو', done: 'جهّز السيناريو', detail: 'اعتراض السعر', result: 'تأمين', duration: 850 },
    { id: 'run', tool: 'run_simulation', icon: ic(Radio), tone: 'lilac', running: 'يدير المحاكاة', done: 'أدار المحاكاة', detail: 'مع أحمد', result: '6 ردود', duration: 1000 },
    { id: 'score', tool: 'score_call', icon: ic(Gauge), tone: 'green', running: 'يقيّم الأداء', done: 'قيّم الأداء', result: '82 من 100', duration: 800 },
  ],
  dash: [
    { id: 'hours', tool: 'query_hours', icon: ic(Timer), tone: 'sky', running: 'يجمع ساعات التدريب', done: 'جمع ساعات التدريب', detail: 'آخر 30 يوماً', result: '74 ساعة', duration: 900 },
    { id: 'rank', tool: 'rank_people', icon: ic(Activity), tone: 'lilac', running: 'يرتّب الموظفين', done: 'رتّب الموظفين', result: 'أعلى 5', duration: 800 },
    { id: 'chart', tool: 'draw_chart', icon: ic(Gauge), tone: 'coral', running: 'يرسم المؤشر', done: 'رسم المؤشر', result: 'جاهز', duration: 700 },
  ],
}

/** How long the answer stays readable after it appears. */
const READ_MS = 5200
/** All five runs take about the same time; use the longest so no answer is cut short. */
const RUN_MS = Math.max(...Object.values(stepCalls).map(agentRunMs))

export function DemoTable() {
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.4 })
  const [pressed, setPressed] = useState(false)
  const { courses, live } = useDemoCourses(6)
  // Scene = type the question → the agent's tasks stream in → fold → answer.
  // Each scene lasts exactly as long as its tasks, plus time to read the answer.
  const demo = useDemoSequence(prompts, {
    paused,
    typeMs: 40,
    jitterMs: [26, 58],
    workingMs: 120,
    clearMs: 260,
    showMs: RUN_MS + READ_MS,
  })
  const current = heroDemoSteps[demo.step] ?? heroDemoSteps[0]
  const sceneMs = Array.from(current.prompt).length * 42 + 380 + RUN_MS + READ_MS

  const jumpTo = (index: number) => {
    demo.goTo(index)
    setPressed(true)
    window.setTimeout(() => setPressed(false), 180)
  }

  const isTyping = demo.phase === 'typing'
  const agentActive = demo.phase === 'working' || demo.phase === 'showing'

  // Phones: keep the active step scrolled into view inside the rail.
  const railRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const rail = railRef.current
    const item = rail?.children[demo.step] as HTMLElement | undefined
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return
    const target = item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2
    rail.scrollTo({ left: target, behavior: 'smooth' })
  }, [demo.step])

  return (
    <div className="demo demo--v2" ref={ref} {...hoverProps} aria-label="عرض تفاعلي لمنصة ماستري">
      <div className="demo__body">
        {/* The five capabilities as one segmented rail; a gradient glider slides to the active one. */}
        <div className="demo-rail-wrap">
          <div className="demo-rail" role="tablist" aria-label="أبعاد العرض" ref={railRef}>
            {heroDemoSteps.map((item, index) => {
              const Icon = stepIcons[item.kind]
              const active = index === demo.step
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={active ? 'demo-rail__item is-active' : 'demo-rail__item'}
                  key={item.pill}
                  onClick={() => jumpTo(index)}
                >
                  {active ? (
                    <motion.span
                      layoutId="demo-rail-glider"
                      className="demo-rail__glider"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      aria-hidden="true"
                    >
                      <span className="demo-rail__timer" key={demo.resultKey} style={{ animationDuration: `${sceneMs}ms` }} />
                    </motion.span>
                  ) : null}
                  <span className="demo-rail__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="demo-rail__label">{item.pill}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="demo__input">
          <Sparkles className="demo__input-icon" size={16} aria-hidden="true" />
          <span className="demo__prompt">
            {demo.text ? (
              <TypewriterChars text={demo.text} ghosts={demo.ghosts} caret={isTyping} phase={demo.typePhase} />
            ) : (
              <span className="demo__placeholder">اكتب طلبك…</span>
            )}
          </span>
          <button
            className={pressed ? 'demo__send is-press' : 'demo__send'}
            type="button"
            aria-label="إرسال الطلب"
            onClick={() => jumpTo(demo.step)}
          >
            <SendHorizontal size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="demo__result demo__result--v2">
          <AgentRun active={agentActive} runKey={demo.resultKey} calls={stepCalls[current.kind]}>
            <Result kind={current.kind} courses={courses} />
          </AgentRun>
        </div>

        <p className="demo__hint">
          <MousePointerClick size={12} aria-hidden="true" />
          {live ? 'برامج حقيقية من مكتبة ماستري للأعمال · ' : ''}
          مثال توضيحي · اضغط أي خطوة لتجربتها
        </p>
      </div>
    </div>
  )
}
