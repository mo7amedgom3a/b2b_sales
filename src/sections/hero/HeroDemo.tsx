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
import { useInViewAutoplay } from '../../motion/useInViewAutoplay'
import { TypewriterChars } from '../../motion/TypewriterText'
import { useExitGhosts, useTypewriter } from '../../motion/useTypewriter'
import { Tag } from '../../ui/Tag'

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
          {cell === 'gap' ? '!' : cell === 'mid' ? '~' : '✓'}
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

const pathRows = [
  { name: 'فهم اعتراضات التأمين', meta: 'الوحدة 1', done: true },
  { name: 'التفاوض على الشروط', meta: 'الوحدة 2', done: true },
  { name: 'محاكاة مع كوتش AI', meta: 'تمرين يومي', done: false },
  { name: 'تطبيق على صفقة حقيقية', meta: 'الأسبوع 4', done: false },
] as const

function PathResult() {
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">مسار: موظف مبيعات تأمين ميداني</span>
        <Tag tone="sky">4 أسابيع</Tag>
      </div>
      <div className="res-rows rise">
        {pathRows.map((row) => (
          <div className="res-row" key={row.name}>
            <span className={row.done ? 'res-row__box res-row__box--done' : 'res-row__box'}>
              {row.done ? <Check size={10} aria-hidden="true" /> : null}
            </span>
            <span className="res-row__name">{row.name}</span>
            <span className="res-row__meta">{row.meta}</span>
          </div>
        ))}
      </div>
      <div className="res-legend">
        <span><i style={{ background: 'var(--coral)' }} /> 2 من 4 مكتمل</span>
        <span>مبني على فجوة الاعتراضات وقطاع التأمين</span>
      </div>
    </div>
  )
}

const trainRows = [
  {
    icon: Video,
    name: 'الدرس 12: إدارة الاعتراضات',
    meta: 'اليوم · 12 دقيقة',
    progress: 60,
    chip: null,
    live: false,
  },
  {
    icon: Bot,
    name: 'محاكاة يومية مع كوتش AI',
    meta: 'كل يوم · 10 دقائق',
    progress: 35,
    chip: 'سلسلة 12 يوماً',
    live: false,
  },
  {
    icon: Radio,
    name: 'بث مباشر: تفاوض متقدم',
    meta: 'الخميس · 60 دقيقة',
    progress: 0,
    chip: 'مباشر',
    live: true,
  },
] as const

function TrainResult() {
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">خطة تدريب الأسبوع</span>
        <Tag tone="green">متجددة</Tag>
      </div>
      <div className="res-rows rise">
        {trainRows.map((row) => {
          const Icon = row.icon
          const ChipIcon = row.live ? Radio : Flame
          return (
            <div className="train-row" key={row.name}>
              <span className="train-row__icon">
                <Icon aria-hidden="true" />
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

const rankRows = [
  { name: 'أحمد العتيبي', value: 92 },
  { name: 'سارة القحطاني', value: 84 },
  { name: 'خالد الشمري', value: 76 },
  { name: 'ريم الدوسري', value: 68 },
  { name: 'عبدالله الحربي', value: 54 },
] as const

function DashResult() {
  return (
    <div className="res rise">
      <div className="res__head">
        <span className="res__title">أكثر 5 موظفي مبيعات نشاطاً</span>
        <Tag tone="yellow">هذا الشهر</Tag>
      </div>
      <div className="res-rank">
        {rankRows.map((row, index) => (
          <div className="res-rank__row" key={row.name}>
            <span className="res-rank__idx">{index + 1}</span>
            <span className="res-rank__name">{row.name}</span>
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
        <span>نشاط التدريب خلال آخر 30 يوماً</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

function Result({ kind }: { kind: HeroDemoKind }) {
  if (kind === 'gaps') return <GapsResult />
  if (kind === 'path') return <PathResult />
  if (kind === 'training') return <TrainResult />
  if (kind === 'sim') return <SimResult />
  return <DashResult />
}

export function HeroDemo() {
  const reduce = usePrefersReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.4 })
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'typing')
  const [pressed, setPressed] = useState(false)

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
              <Result kind={current.kind} />
            </div>
          )}
        </div>

        <p className="demo__hint">
          <Sparkles size={11} aria-hidden="true" />
          تفاعلي — اضغط أي بُعد لتجربته. يتوقف تلقائياً عند خروجه من الشاشة.
        </p>
      </div>
    </div>
  )
}
