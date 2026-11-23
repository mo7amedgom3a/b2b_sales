import {
  Activity,
  Bot,
  CalendarDays,
  Check,
  Flame,
  Gauge,
  GraduationCap,
  Info,
  Keyboard,
  LayoutDashboard,
  MousePointerClick,
  Radio,
  RefreshCw,
  Route,
  SendHorizontal,
  Sparkles,
  Stethoscope,
  Timer,
  UsersRound,
  Video,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { demoPeople, heroDemoSteps } from '../../content/ar'
import type { HeroDemoKind } from '../../content/ar'
import { useDemoCourses } from '../../lib/demoCourses'
import type { DemoCourse } from '../../lib/demoCourses'
import { formatNumber } from '../../lib/format'
import { useInViewAutoplay } from '../../motion/useInViewAutoplay'
import { TypewriterChars } from '../../motion/TypewriterText'
import { useDemoSequence } from '../../motion/useDemoSequence'
import { Avatar } from '../../ui/Avatar'
import { ScrollArrows } from '../../ui/ScrollArrows'
import { Tag } from '../../ui/Tag'
import { AnimateIcon, AnimatedAlert, AnimatedCheck, AnimatedMinus } from '../../ui/animated-icons'

const prompts = heroDemoSteps.map((step) => step.prompt)

const stepIcons = {
  gaps: Stethoscope,
  path: Route,
  training: GraduationCap,
  sim: Bot,
  dash: Gauge,
} as const

const skillLabels: Record<string, string> = {
  gap: 'فجوة',
  mid: 'متوسط',
  good: 'قوي',
}

const gapRows = [
  { name: 'أحمد', cells: ['good', 'mid', 'gap', 'mid'] },
  { name: 'سارة', cells: ['mid', 'good', 'gap', 'good'] },
  { name: 'خالد', cells: ['gap', 'mid', 'gap', 'mid'] },
  { name: 'ريم', cells: ['good', 'good', 'mid', 'gap'] },
] as const

const skills = ['تنقيب', 'إقناع', 'اعتراضات', 'إغلاق'] as const

function GapsResult() {
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">فجوات فريق المبيعات</span>
        <Tag tone="coral">إدارة الاعتراضات</Tag>
      </div>
      <div className="res-matrix">
        <span className="res-matrix__head">موظف المبيعات</span>
        {skills.map((skill) => (
          <span className="res-matrix__head" key={skill}>
            {skill}
          </span>
        ))}
        {gapRows.map((row) => (
          <FragmentRow key={row.name} name={row.name} cells={row.cells} />
        ))}
      </div>
      <div className="res-legend">
        <span><i style={{ background: 'var(--coral)' }} /> فجوة حرجة</span>
        <span><i style={{ background: 'var(--yellow)' }} /> تحتاج تدريباً</span>
        <span><i style={{ background: 'var(--green)' }} /> جدارة قوية</span>
      </div>
    </div>
  )
}

function FragmentRow({ name, cells }: { name: string; cells: readonly string[] }) {
  return (
    <>
      <span className="res-matrix__name">{name}</span>
      {cells.map((cell, index) => (
        <span
          className={`res-cell res-cell--${cell}`}
          key={`${name}-${index}`}
          role="img"
          aria-label={`${name}: ${skills[index]} — ${skillLabels[cell] ?? cell}`}
        >
          <AnimateIcon animateOnHover>
            {cell === 'gap' ? (
              <AnimatedAlert size={12} />
            ) : cell === 'mid' ? (
              <AnimatedMinus size={12} />
            ) : (
              <AnimatedCheck size={12} />
            )}
          </AnimateIcon>
        </span>
      ))}
    </>
  )
}

function SimResult() {
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">محاكاة: اعتراض السعر</span>
        <Tag tone="green">تقييم فوري</Tag>
      </div>
      <div className="res-chat rise">
        <span className="bubble bubble--bot">العميل: السعر أعلى من الميزانية، لماذا أدفع أكثر؟</span>
        <span className="bubble bubble--user">أحمد: أتفهم ذلك. دعنا نقارن تكلفة التأخير بقيمة الحل…</span>
        <span className="bubble bubble--coach">كوتش: جيد جداً. وضّح العائد قبل عرض الخصم.</span>
      </div>
      <div className="score">
        <div className="score__ring" aria-hidden="true">
          <svg viewBox="0 0 52 52">
            <circle className="track" cx="26" cy="26" r="22" />
            <circle className="bar" cx="26" cy="26" r="22" />
          </svg>
          <span className="score__num">82</span>
        </div>
        <div className="score__body">
          <b>أداء المحاكاة</b>
          <span>تفاوض على القيمة</span>
          <div className="score__chips">
            <Tag tone="green">وضوح القيمة</Tag>
            <Tag tone="yellow">إغلاق</Tag>
          </div>
        </div>
      </div>
    </div>
  )
}

const fallbackPathRows = [
  { name: 'فهم اعتراضات التأمين', meta: 'الوحدة 1', done: true, avatar: null },
  { name: 'التفاوض على الشروط', meta: 'الوحدة 2', done: true, avatar: null },
  { name: 'محاكاة مع كوتش AI', meta: 'تمرين يومي', done: false, avatar: null },
  { name: 'تطبيق على صفقة حقيقية', meta: 'الأسبوع 4', done: false, avatar: null },
] as const

function toPathRows(courses: DemoCourse[]) {
  if (courses.length < 2) return fallbackPathRows
  return courses.slice(0, 4).map((course, index) => ({
    name: course.title,
    meta: `${formatNumber(course.lessons)} درساً`,
    done: index < 2,
    avatar: course.avatar,
  }))
}

function PathResult({ courses }: { courses: DemoCourse[] }) {
  const rows = toPathRows(courses)
  const doneCount = rows.filter((row) => row.done).length
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">مسار: موظف مبيعات تأمين ميداني</span>
        <Tag tone="sky">4 أسابيع</Tag>
      </div>
      <div className="res-rows rise">
        {rows.map((row) => (
          <div className="res-row" key={row.name}>
            <span className={row.done ? 'res-row__box res-row__box--done' : 'res-row__box'}>
              {row.done ? <Check size={10} aria-hidden="true" /> : null}
            </span>
            <span className="res-row__name res-row__name--media">
              {row.avatar ? (
                <img className="demo-avatar" src={row.avatar} alt="" loading="lazy" referrerPolicy="no-referrer" />
              ) : null}
              <span className="res-row__label">{row.name}</span>
            </span>
            <span className="res-row__meta">{row.meta}</span>
          </div>
        ))}
      </div>
      <div className="res-legend">
        <span><i style={{ background: 'var(--coral)' }} /> {doneCount} من {rows.length} مكتمل</span>
        <span>مبني على فجوة الاعتراضات وقطاع التأمين</span>
      </div>
    </div>
  )
}

const fallbackTrainRows = [
  {
    icon: Video,
    name: 'الدرس 12: إدارة الاعتراضات',
    meta: 'اليوم · 12 دقيقة',
    progress: 60,
    chip: null as string | null,
    live: false,
    image: null as string | null,
  },
  {
    icon: Bot,
    name: 'محاكاة يومية مع كوتش AI',
    meta: 'كل يوم · 10 دقائق',
    progress: 35,
    chip: 'سلسلة 12 يوماً',
    live: false,
    image: null,
  },
  {
    icon: Radio,
    name: 'بث مباشر: تفاوض متقدم',
    meta: 'الخميس · 60 دقيقة',
    progress: 0,
    chip: 'مباشر',
    live: true,
    image: null,
  },
] as const

function toTrainRows(courses: DemoCourse[]) {
  if (courses.length < 2) return fallbackTrainRows
  return courses.slice(0, 3).map((course, index) => ({
    icon: index === 2 ? Radio : index === 1 ? Bot : Video,
    name: course.title,
    meta: [course.duration, `${formatNumber(course.lessons)} درساً`].filter(Boolean).join(' · '),
    progress: index === 0 ? 60 : index === 1 ? 35 : 0,
    chip: index === 1 ? 'سلسلة 12 يوماً' : index === 2 ? 'مباشر' : null,
    live: index === 2,
    image: course.image,
  }))
}

function TrainResult({ courses }: { courses: DemoCourse[] }) {
  const rows = toTrainRows(courses)
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">خطة تدريب الأسبوع</span>
        <Tag tone="green">متجددة</Tag>
      </div>
      <div className="res-rows rise">
        {rows.map((row) => {
          const Icon = row.icon
          const ChipIcon = row.live ? Radio : Flame
          return (
            <div className="train-row" key={row.name}>
              <span className="train-row__icon">
                {row.image ? (
                  <img src={row.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
                ) : (
                  <Icon aria-hidden="true" />
                )}
              </span>
              <span className="train-row__body">
                <span className="train-row__name">{row.name}</span>
                <span className="train-row__meta">{row.meta}</span>
                <span className="train-row__track">
                  <span className="train-row__fill" style={{ width: `${row.progress}%` }} />
                </span>
              </span>
              {row.chip ? (
                <span className={row.live ? 'train-row__chip train-row__chip--live' : 'train-row__chip'}>
                  <ChipIcon aria-hidden="true" />
                  {row.chip}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
      <div className="res-legend">
        <span>
          <RefreshCw size={11} aria-hidden="true" /> تتحدث الخطة أسبوعياً حسب تشخيص الفريق
        </span>
        <span>
          <Info size={11} aria-hidden="true" /> مثال توضيحي
        </span>
      </div>
    </div>
  )
}

function DashResult() {
  // Same team as the question: the 5 most active sales reps this month.
  const rows = [...demoPeople].sort((a, b) => b.hours - a.hours).slice(0, 5)
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">
          <UsersRound size={13} aria-hidden="true" /> أكثر 5 موظفي مبيعات نشاطاً
        </span>
        <Tag tone="yellow" icon={<CalendarDays aria-hidden="true" />}>هذا الشهر</Tag>
      </div>
      <div className="res-rank">
        {rows.map((person, index) => (
          <div className="res-rank__row" key={person.id} style={{ animationDelay: `${index * 80}ms` }}>
            <span className="res-rank__idx">{index + 1}</span>
            <span className="res-rank__name res-rank__name--media">
              <Avatar initial={person.initial} tone={person.tone} size={20} />
              <span className="res-rank__label">{person.name}</span>
            </span>
            <span className="res-rank__track">
              <span
                className="res-rank__bar"
                style={{ width: `${person.completion}%`, animationDelay: `${index * 80}ms` }}
              />
            </span>
            <span className="res-rank__val">
              <Timer size={10} aria-hidden="true" /> {formatNumber(person.hours)} س
            </span>
          </div>
        ))}
      </div>
      <div className="res-legend">
        <span>
          <Activity size={11} aria-hidden="true" /> مرتّبون حسب ساعات التدريب خلال آخر 30 يوماً
        </span>
        <span>
          <Info size={11} aria-hidden="true" /> مثال توضيحي
        </span>
      </div>
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

export function HeroDemo() {
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.4 })
  const [pressed, setPressed] = useState(false)
  const pillsRef = useRef<HTMLDivElement>(null)
  const { courses, live } = useDemoCourses(6)
  const demo = useDemoSequence(prompts, {
    paused,
    typeMs: 58,
    jitterMs: [46, 88],
    workingMs: 850,
    showMs: 4600,
  })
  const current = heroDemoSteps[demo.step] ?? heroDemoSteps[0]

  const jumpTo = (index: number) => {
    demo.goTo(index)
    setPressed(true)
    window.setTimeout(() => setPressed(false), 180)
  }

  const isTyping = demo.phase === 'typing'
  const isWorking = demo.phase === 'working'

  return (
    <div className="demo" ref={ref} {...hoverProps} aria-label="عرض تفاعلي لمنصة ماستري">
      <div className="demo__top">
        <span className="demo__brand">
          <LayoutDashboard size={14} aria-hidden="true" />
          ماستري — لوحة التدريب
        </span>
        <Tag tone="soft" icon={<Info aria-hidden="true" />}>مثال توضيحي</Tag>
      </div>

      <div className="demo__body">
        <div className="demo__input">
          <Sparkles className="demo__input-icon" size={14} aria-hidden="true" />
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

        <ScrollArrows scrollerRef={pillsRef} className="demo__pills-wrap" label="أبعاد العرض">
        <ToggleGroup
          ref={pillsRef}
          type="single"
          className="demo__pills"
          aria-label="أبعاد العرض"
          value={String(demo.step)}
          onValueChange={(value) => {
            if (value) jumpTo(Number(value))
          }}
        >
          {heroDemoSteps.map((item, index) => {
            const Icon = stepIcons[item.kind]
            return (
              <ToggleGroupItem className="demo__pill" value={String(index)} key={item.pill} showCheck={false}>
                <Icon size={13} aria-hidden="true" />
                {item.pill}
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
        </ScrollArrows>

        <div className="demo__result">
          <div className="demo__status" aria-live="polite">
            {isWorking ? (
              <>
                <span className="pulse" aria-hidden="true" />
                جارٍ تحليل بيانات الفريق…
              </>
            ) : demo.resultVisible ? (
              <>
                <span className="demo__tag" aria-hidden="true">
                  <Check size={10} /> تم
                </span>
                النتيجة جاهزة — {current.pill}
              </>
            ) : (
              <>
                <Keyboard size={12} aria-hidden="true" />
                يكتب الطلب…
              </>
            )}
          </div>

          {demo.resultVisible ? (
            <div key={demo.resultKey}>
              <Result kind={current.kind} courses={courses} />
            </div>
          ) : (
            <div className={isWorking ? 'demo__skeleton is-working' : 'demo__skeleton'} aria-hidden="true">
              <Skeleton className="demo__skeleton-bar" />
              <Skeleton className="demo__skeleton-bar" />
              <Skeleton className="demo__skeleton-bar" />
            </div>
          )}
        </div>

        <p className="demo__hint">
          <MousePointerClick size={11} aria-hidden="true" />
          {live ? 'دورات حقيقية من مكتبة ماستري — ' : ''}
          تفاعلي — اضغط أي بُعد لتجربته. يتوقف تلقائياً عند خروجه من الشاشة.
        </p>
      </div>
    </div>
  )
}
