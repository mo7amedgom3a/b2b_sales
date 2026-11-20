import { Check, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Icon } from '../../ui/Icon'
import { heroDemoSteps } from '../../content/ar'
import type { HeroDemoKind } from '../../content/ar'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useInViewAutoplay } from '../../motion/useInViewAutoplay'
import { Tag } from '../../ui/Tag'

type Phase = 'typing' | 'working' | 'done' | 'erasing'

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
        <span className="res-matrix__head">المندوب</span>
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
          aria-label={`${name}: ${skills[index]} — ${cell === 'gap' ? 'فجوة' : cell === 'mid' ? 'متوسط' : 'قوي'}`}
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
        <span className="res__title">مسار: مندوب تأمين ميداني</span>
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
        <span className="res__title">أكثر 5 مندوبين نشاطاً</span>
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
  if (kind === 'sim') return <SimResult />
  if (kind === 'path') return <PathResult />
  return <DashResult />
}

export function HeroDemo() {
  const reduce = usePrefersReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.4 })
  const [step, setStep] = useState(0)
  const [activeStep, setActiveStep] = useState(0)
  const [displayStep, setDisplayStep] = useState(0)
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'typing')
  const [typed, setTyped] = useState(reduce ? heroDemoSteps[0].prompt : '')
  const [pressed, setPressed] = useState(false)

  const current = heroDemoSteps[step]
  const totalChars = Array.from(current.prompt).length
  const display = heroDemoSteps[displayStep]
  const isWorking = phase === 'working'
  const isDone = phase === 'done'
  const isTyping = phase === 'typing' || phase === 'erasing'

  useEffect(() => {
    if (reduce) {
      setTyped(current.prompt)
      setPhase('done')
      setDisplayStep(step)
      return
    }
    if (paused) return

    if (phase === 'typing') {
      if (Array.from(typed).length < totalChars) {
        const timer = window.setTimeout(() => {
          const next = Array.from(current.prompt).slice(0, Array.from(typed).length + 2).join('')
          setTyped(next)
        }, 105)
        return () => window.clearTimeout(timer)
      }

      let press = 0
      const hold = window.setTimeout(() => {
        setPressed(true)
        press = window.setTimeout(() => {
          setPressed(false)
          setPhase('working')
        }, 150)
      }, 420)
      return () => {
        window.clearTimeout(hold)
        window.clearTimeout(press)
      }
    }

    if (phase === 'working') {
      setActiveStep(step)
      setDisplayStep(step)
      const timer = window.setTimeout(() => setPhase('done'), 1050)
      return () => window.clearTimeout(timer)
    }

    if (phase === 'done') {
      const timer = window.setTimeout(() => setPhase('erasing'), 1650)
      return () => window.clearTimeout(timer)
    }

    if (phase === 'erasing') {
      const timer = window.setTimeout(() => {
        const currentChars = Array.from(typed)
        if (currentChars.length <= 3) {
          setTyped('')
          setStep((value) => (value + 1) % heroDemoSteps.length)
          setPhase('typing')
          return
        }
        setTyped(currentChars.slice(0, currentChars.length - 3).join(''))
      }, 90)
      return () => window.clearTimeout(timer)
    }

    return undefined
  }, [phase, typed, paused, reduce, step, current.prompt, totalChars])

  const jumpTo = (index: number) => {
    setStep(index)
    setActiveStep(index)
    setDisplayStep(index)
    setPressed(false)
    if (reduce) {
      setTyped(heroDemoSteps[index].prompt)
      setPhase('done')
      return
    }
    setTyped('')
    setPhase('typing')
  }

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
            {typed ? typed : <span className="demo__placeholder">اكتب طلبك…</span>}
            {isTyping ? <span className="demo__caret" aria-hidden="true" /> : null}
          </span>
          <button
            className={pressed ? 'demo__send is-press' : 'demo__send'}
            type="button"
            aria-label="إرسال الطلب"
            onClick={() => jumpTo(step)}
          >
            <Icon name="arrow" />
          </button>
        </div>

        <div className="demo__pills" role="group" aria-label="أبعاد العرض">
          {heroDemoSteps.map((item, index) => (
            <button
              className="demo__pill"
              type="button"
              key={item.pill}
              aria-pressed={index === activeStep}
              onClick={() => jumpTo(index)}
            >
              <span className="orb" aria-hidden="true" />
              {item.pill}
            </button>
          ))}
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
            <div key={`${displayStep}-${isDone ? 'done' : 'preview'}`}>
              <Result kind={display.kind} />
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
