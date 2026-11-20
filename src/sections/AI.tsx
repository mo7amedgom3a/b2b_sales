import * as Tabs from '@radix-ui/react-tabs'
import { BookOpenCheck, Bot, Network, Quote, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { ai } from '../content/ar'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { Reveal } from '../motion/Reveal'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const simChat = [
  { who: 'client', text: 'السعر أعلى من الميزانية، لماذا أدفع أكثر؟' },
  { who: 'rep', text: 'أتفهم ذلك. دعنا نقارن تكلفة التأخير بقيمة الحل…' },
  { who: 'coach', text: 'ممتاز. وضّح العائد قبل أن تذكر أي خصم.' },
] as const

const lessonChat = [
  { who: 'user', text: 'لماذا لا نرد على الاعتراض بالسعر مباشرة؟' },
  { who: 'coach', text: 'لأن السعر ليس السبب دائماً. ابدأ بسؤال يوضح تكلفة التأخير، ثم اربط القيمة بالنتيجة.' },
] as const

const mcpRows = [
  ['أحمد العتيبي', '18.5', '92%'],
  ['سارة القحطاني', '16.2', '84%'],
  ['خالد الشمري', '14.8', '76%'],
  ['ريم الدوسري', '13.1', '68%'],
  ['عبدالله الحربي', '11.4', '54%'],
] as const

function SimMock() {
  return (
    <div className="mock rise">
      <div className="mock__top">
        <span>محاكاة بيع · تأمين</span>
        <Tag tone="green">مباشر</Tag>
      </div>
      <div className="mock__body">
        <div className="res-chat rise">
          {simChat.map((line, index) => (
            <span
              className={
                line.who === 'client'
                  ? 'bubble bubble--bot'
                  : line.who === 'rep'
                    ? 'bubble bubble--user'
                    : 'bubble bubble--coach'
              }
              key={index}
            >
              {line.text}
            </span>
          ))}
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
            <b>تقييم المحاكاة</b>
            <span>تفاوض على القيمة</span>
            <div className="score__chips">
              <Tag tone="green">وضوح القيمة</Tag>
              <Tag tone="yellow">إغلاق</Tag>
            </div>
          </div>
        </div>
      </div>
      <div className="mock__foot">
        <span>السيناريو: اعتراض على السعر</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

function LessonMock() {
  return (
    <div className="mock rise">
      <div className="mock__top">
        <span>الدرس 03 · إدارة الاعتراضات</span>
        <Tag tone="soft">كوتش الدرس</Tag>
      </div>
      <div className="mock__body">
        <div className="res-chat rise">
          {lessonChat.map((line, index) => (
            <span className={line.who === 'user' ? 'bubble bubble--user' : 'bubble bubble--coach'} key={index}>
              {line.text}
            </span>
          ))}
        </div>
        <div className="res-rows">
          <div className="res-row">
            <span className="res-row__box res-row__box--done">✓</span>
            <span className="res-row__name">اختبر فهمك: ما أول خطوة عند اعتراض السعر؟</span>
          </div>
          <div className="res-row">
            <span className="res-row__box" />
            <span className="res-row__name">اشرح بأمثلة من بيئة عملك</span>
            <span className="res-row__meta">2 خيارات</span>
          </div>
        </div>
      </div>
      <div className="mock__foot">
        <span>إجابة فورية داخل الدرس</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

function McpMock() {
  return (
    <div className="mock rise">
      <div className="mock__top">
        <span>Claude · MCP</span>
        <Tag tone="purple">اتصال آمن</Tag>
      </div>
      <div className="mock__body">
        <div className="bubble bubble--user" style={{ maxWidth: '100%' }}>
          من أكثر 5 مندوبين نشاطاً هذا الشهر؟
        </div>
        <table className="mock__table">
          <thead>
            <tr>
              <th>المندوب</th>
              <th>ساعات</th>
              <th>إكمال</th>
            </tr>
          </thead>
          <tbody>
            {mcpRows.map(([name, hours, completion]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{hours}</td>
                <td>{completion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mock__foot">
        <span>تقرير جاهز خلال ثوانٍ</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

const tabIcons = { sim: Bot, lesson: BookOpenCheck, mcp: Network } as const

const mocks = {
  sim: SimMock,
  lesson: LessonMock,
  mcp: McpMock,
} as const

export function AI() {
  const reduce = useReducedMotion()
  const [value, setValue] = useState('sim')
  const [auto, setAuto] = useState(true)
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.3 })

  useEffect(() => {
    if (reduce || !auto || paused) return
    const timer = window.setInterval(() => {
      setValue((current) => {
        const index = ai.tabs.findIndex((tab) => tab.id === current)
        return ai.tabs[(index + 1) % ai.tabs.length]?.id ?? 'sim'
      })
    }, 7000)
    return () => window.clearInterval(timer)
  }, [reduce, auto, paused])

  return (
    <section className="section ai" id="ai">
      <div className="ma-container" ref={ref}>
        <SecHead index="07" title={ai.title} lead={ai.lead} />

        <Tabs.Root
          value={value}
          onValueChange={(next) => {
            setValue(next)
            setAuto(false)
          }}
        >
          <Tabs.List className="ma-tabs ai__tabs" aria-label="حلول الذكاء الاصطناعي">
            {ai.tabs.map((tab, index) => {
              const Icon = tabIcons[tab.id as keyof typeof tabIcons]
              return (
                <Tabs.Trigger value={tab.id} className="ai-tab" key={tab.id}>
                  <Icon className="ai-tab__icon" aria-hidden="true" />
                  <span className="ai-tab__num">0{index + 1}</span>
                  {tab.label}
                </Tabs.Trigger>
              )
            })}
          </Tabs.List>

          <div className="ai__progress-wrap" aria-hidden="true">
            {auto && !reduce && !paused ? <span key={value} className="ai__progress-run" /> : null}
          </div>

          {ai.tabs.map((tab) => {
            const Mock = mocks[tab.id as keyof typeof mocks]
            return (
              <Tabs.Content value={tab.id} className="ai__panel" key={tab.id}>
                <Reveal className="ai__copy">
                  <Tag tone="coral">0{ai.tabs.findIndex((item) => item.id === tab.id) + 1}</Tag>
                  <h3>{tab.title}</h3>
                  <p>{tab.body}</p>
                  <ul className="ai__bullets">
                    {tab.bullets.map((bullet) => (
                      <li key={bullet}>
                        <Sparkles aria-hidden="true" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                <Reveal className="ai__mock" delay={0.08}>
                  <Mock />
                </Reveal>
              </Tabs.Content>
            )
          })}
        </Tabs.Root>

        <p className="ai__extra">
          <Quote size={14} aria-hidden="true" style={{ display: 'inline', marginInlineEnd: 6, color: 'var(--coral)' }} />
          {ai.extra}
        </p>
      </div>
    </section>
  )
}
