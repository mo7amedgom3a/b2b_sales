import {
  ArrowRight,
  Bot,
  Check,
  Flame,
  Gauge,
  GraduationCap,
  Radio,
  Route,
  Sparkles,
  Stethoscope,
  Video,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { heroDemoSteps } from '../../content/ar'
import type { HeroDemoKind } from '../../content/ar'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useDemoCourses } from '../../lib/demoCourses'
import type { DemoCourse } from '../../lib/demoCourses'
import { formatNumber } from '../../lib/format'
import { useInViewAutoplay } from '../../motion/useInViewAutoplay'
import { TypewriterChars } from '../../motion/TypewriterText'
import { useExitGhosts, useTypewriter } from '../../motion/useTypewriter'
import { Tag } from '../../ui/Tag'
import { AnimateIcon, AnimatedAlert, AnimatedCheck, AnimatedMinus } from '../../ui/animated-icons'

type Phase = 'typing' | 'working' | 'done'

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
        <span>تتحدث الخطة أسبوعياً حسب تشخيص الفريق</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

const fallbackRankRows = [
  { name: 'أحمد العتيبي', value: 92, image: null },
  { name: 'سارة القحطاني', value: 84, image: null },
  { name: 'خالد الشمري', value: 76, image: null },
  { name: 'ريم الدوسري', value: 68, image: null },
  { name: 'عبدالله الحربي', value: 54, image: null },
] as const

function toRankRows(courses: DemoCourse[]) {
  if (courses.length < 3) return fallbackRankRows
  const values = [92, 84, 76, 68, 54]
  return courses.slice(0, 5).map((course, index) => ({
    name: course.title,
    value: values[index] ?? 50,
    image: course.image,
  }))
}

function DashResult({ courses }: { courses: DemoCourse[] }) {
  const rows = toRankRows(courses)
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">أكثر 5 دورات إنجازاً</span>
        <Tag tone="yellow">هذا الشهر</Tag>
      </div>
      <div className="res-rank">
        {rows.map((row, index) => (
          <div className="res-rank__row" key={row.name}>
            <span className="res-rank__idx">{index + 1}</span>
            <span className="res-rank__name res-rank__name--media">
              {row.image ? (
                <img className="demo-thumb" src={row.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
              ) : null}
              <span className="res-rank__label">{row.name}</span>
            </span>
            <span className="res-rank__track">
              <span
                className="res-rank__bar"
                style={{ width: `${row.value}%`, animationDelay: `${index * 70}ms` }}
              />
            </span>
            <span className="res-rank__val">{row.value}%</span>
          </div>
        ))}
      </div>
      <div className="res-legend">
        <span>إنجاز المتدربين خلال آخر 30 يوماً</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

function Result({ kind, courses }: { kind: HeroDemoKind; courses: DemoCourse[] }) {
  if (kind === 'gaps') return <GapsResult />
  if (kind === 'path') return <PathResult courses={courses} />
  if (kind === 'training') return <TrainResult courses={courses} />
  if (kind === 'sim') return <SimResult />
  return <DashResult courses={courses} />
}

export function HeroDemo() {
  const reduce = usePrefersReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.4 })
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'typing')
  const [pressed, setPressed] = useState(false)
  const { courses, live } = useDemoCourses(6)

  const current = heroDemoSteps[step] ?? heroDemoSteps[0]
  const { text, phase: twPhase } = useTypewriter([current.prompt], {
    loop: false,
    paused,
    restartKey: `${step}-${current.prompt}`,
    jitterMs: [46, 92],
    holdMs: 10_000,
    typeMs: 58,
  })
  const ghosts = useExitGhosts(text)

  useEffect(() => {
    if (reduce) return
    if (phase === 'typing' && twPhase === 'holding') {
      const timer = window.setTimeout(() => setPhase('working'), 260)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'working') {
      const timer = window.setTimeout(() => setPhase('done'), 850)
      return () => window.clearTimeout(timer)
    }
    if (phase === 'done') {
      const timer = window.setTimeout(() => {
        setStep((value) => (value + 1) % heroDemoSteps.length)
        setPhase('typing')
      }, 2300)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [phase, twPhase, reduce])

  const jumpTo = (index: number) => {
    setStep(index)
    setPressed(true)
    if (reduce) {
      setPhase('done')
      return
    }
    setPhase('typing')
    window.setTimeout(() => setPressed(false), 180)
  }

  const isWorking = phase === 'working'
  const isDone = phase === 'done'
  const isTyping = phase === 'typing'

  return (
    <div className="demo" ref={ref} {...hoverProps} aria-label="عرض تفاعلي لمنصة ماستري">
      <div className="demo__top">
        <span className="demo__brand">
          <span className="dot" aria-hidden="true" />
          ماستري — لوحة التدريب
        </span>
        <Tag tone="soft">مثال توضيحي</Tag>
      </div>

      <div className="demo__body">
        <div className="demo__input">
          <span className="demo__prompt">
            {text ? (
              <TypewriterChars text={text} ghosts={ghosts} caret={isTyping} phase={twPhase} />
            ) : (
              <span className="demo__placeholder">اكتب طلبك…</span>
            )}
          </span>
          <button
            className={pressed ? 'demo__send is-press' : 'demo__send'}
            type="button"
            aria-label="إرسال الطلب"
            onClick={() => jumpTo(step)}
          >
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="demo__pills" role="group" aria-label="أبعاد العرض">
          {heroDemoSteps.map((item, index) => {
            const Icon = stepIcons[item.kind]
            return (
              <button
                className="demo__pill"
                type="button"
                key={item.pill}
                aria-pressed={index === step}
                onClick={() => jumpTo(index)}
              >
                <Icon size={13} aria-hidden="true" />
                {item.pill}
              </button>
            )
          })}
        </div>

        <div className="demo__result">
          <div className="demo__status" aria-live="polite">
            {isWorking ? (
              <>
                <span className="pulse" aria-hidden="true" />
                جارٍ تحليل بيانات الفريق…
              </>
            ) : isDone ? (
              <>
                <span className="demo__tag" aria-hidden="true">تم</span>
                النتيجة جاهزة — {current.pill}
              </>
            ) : (
              <>
                <Sparkles size={12} aria-hidden="true" />
                اكتب طلباً أو اختر بُعداً من الأسفل
              </>
            )}
          </div>

          {isWorking ? (
            <div className="demo__skeleton" aria-hidden="true">
              <span className="demo__skeleton-bar" />
              <span className="demo__skeleton-bar" />
              <span className="demo__skeleton-bar" />
            </div>
          ) : (
            <div key={`${step}-${isDone ? 'done' : 'preview'}`}>
              <Result kind={current.kind} courses={courses} />
            </div>
          )}
        </div>

        <p className="demo__hint">
          <Sparkles size={11} aria-hidden="true" />
          {live ? 'دورات حقيقية من مكتبة ماستري — ' : ''}
          تفاعلي — اضغط أي بُعد لتجربته. يتوقف تلقائياً عند خروجه من الشاشة.
        </p>
      </div>
    </div>
  )
}
