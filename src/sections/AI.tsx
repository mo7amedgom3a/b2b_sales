import * as Tabs from '@radix-ui/react-tabs'
import {
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Bot,
  Check,
  MessageSquare,
  Network,
  Quote,
  Sparkles,
  Timer,
  ShieldCheck,
  UsersRound,
  Wand2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { ai } from '../content/ar'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterText } from '../motion/TypewriterText'
import { Reveal } from '../motion/Reveal'
import { ChartContainer, ChartTooltip, ChartTooltipContent, kitColor } from '../ui/chart'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const simChat = [
  { who: 'client', text: 'السعر أعلى من الميزانية، لماذا أدفع أكثر؟' },
  { who: 'rep', text: 'أتفهم ذلك. دعنا نقارن تكلفة التأخير بقيمة الحل…' },
  { who: 'coach', text: 'ممتاز. وضّح العائد قبل أن تذكر أي خصم.' },
] as const

const lessonChat = [
  { who: 'user', text: 'لماذا لا نرد على الاعتراض بالسعر مباشرة؟' },
  { who: 'coach', text: 'لأن السعر ليس السبب دائماً. ابدأ بسؤال يوضح تكلفة التأخير، ثم اربط القيمة بالنتيجة.' },
] as const

const mcpTop = [
  ['أحمد العتيبي', '18.5', '92%'],
  ['سارة القحطاني', '16.2', '84%'],
  ['خالد الشمري', '14.8', '76%'],
  ['ريم الدوسري', '13.1', '68%'],
  ['عبدالله الحربي', '11.4', '54%'],
] as const

const groupRows = [
  { name: 'المبيعات — الرياض', value: 92 },
  { name: 'خدمة العملاء — جدة', value: 86 },
  { name: 'الموارد البشرية — القاهرة', value: 74 },
  { name: 'المبيعات — الدمام', value: 63 },
  { name: 'خدمة العملاء — الرياض', value: 58 },
] as const

const groupConfig = { value: { label: 'نشاط التدريب', color: kitColor('coral') } } as const

const mcpPrompts = [
  'من أكثر 5 موظفي مبيعات نشاطاً هذا الشهر؟',
  'ما هي أكثر المجموعات نشاطاً؟',
  'نواجه تحدياً في التفاوض مع العميل، ابنِ لي سيناريو محاكاة للمجموعة',
] as const

const scenarioSteps = [
  'افتح بالسؤال عن وضع العقد الحالي والتحدي الأكبر.',
  'اعرض تكلفة التأخير قبل مناقشة السعر.',
  'اختم بخيارين واضحين وخطوة تالية محددة.',
] as const

const bulletIcons = [ShieldCheck, Timer, MessageSquare, UsersRound, BadgeCheck] as const

function MockPrompt({ text, paused, live = false }: { text: string; paused: boolean; live?: boolean }) {
  return (
    <div className="mock__prompt">
      <Sparkles aria-hidden="true" />
      <TypewriterText
        texts={[text]}
        loop={false}
        paused={paused}
        holdMs={10_000}
        jitterMs={[38, 74]}
        live={live}
      />
    </div>
  )
}

function ScoreRing({ value }: { value: number }) {
  return (
    <div className="score__ring" aria-hidden="true">
      <svg viewBox="0 0 52 52">
        <circle className="track" cx="26" cy="26" r="22" />
        <circle className="bar" cx="26" cy="26" r="22" />
      </svg>
      <span className="score__num">{value}</span>
    </div>
  )
}

function SimMock({ paused }: { paused: boolean }) {
  return (
    <div className="mock rise card-raised card-tone-coral">
      <div className="mock__top">
        <span>محاكاة بيع · تأمين</span>
        <Tag tone="green">مباشر</Tag>
      </div>
      <div className="mock__body">
        <MockPrompt text="درّب أحمد على اعتراض السعر، وسجّل تقييماً فورياً" paused={paused} />
        <div className="mock__result">
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
            <ScoreRing value={82} />
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
      </div>
      <div className="mock__foot">
        <span>السيناريو: اعتراض على السعر</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

function LessonMock({ paused }: { paused: boolean }) {
  return (
    <div className="mock rise card-raised card-tone-yellow">
      <div className="mock__top">
        <span>الدرس 03 · إدارة الاعتراضات</span>
        <Tag tone="soft">كوتش الدرس</Tag>
      </div>
      <div className="mock__body">
        <MockPrompt text="اشرح بأمثلة من بيئة عملي في خدمة العملاء" paused={paused} />
        <div className="mock__result">
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
      </div>
      <div className="mock__foot">
        <span>إجابة فورية داخل الدرس</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

function GroupsChart({ paused }: { paused: boolean }) {
  return (
    <ChartContainer config={groupConfig} height={168} aria-label="أكثر المجموعات نشاطاً">
      <BarChart data={[...groupRows]} layout="vertical" margin={{ top: 2, right: 4, bottom: 2, left: 4 }}>
        <CartesianGrid horizontal={false} stroke="var(--line)" />
        <XAxis type="number" domain={[0, 100]} reversed hide />
        <YAxis
          type="category"
          dataKey="name"
          orientation="right"
          width={104}
          tick={{ fontSize: 9 }}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={{ fill: 'var(--fill-soft)' }}
          content={<ChartTooltipContent config={groupConfig} valueSuffix="%" hideLabel />}
        />
        <Bar
          dataKey="value"
          fill="var(--coral)"
          radius={[3, 3, 3, 3]}
          isAnimationActive={!paused}
          animationDuration={900}
        />
      </BarChart>
    </ChartContainer>
  )
}

function McpMock({ paused }: { paused: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (paused) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % mcpPrompts.length), 3900)
    return () => window.clearInterval(timer)
  }, [paused])

  return (
    <div className="mock rise card-raised card-tone-purple" key={`mcp-${index}`}>
      <div className="mock__top">
        <span>Claude · MCP</span>
        <Tag tone="purple">اتصال آمن</Tag>
      </div>
      <div className="mock__body">
        <MockPrompt text={mcpPrompts[index] ?? mcpPrompts[0]} paused={paused} />
        <div className="mock__result">
          {index === 0 ? (
            <table className="mock__table">
              <thead>
                <tr>
                  <th>موظف المبيعات</th>
                  <th>ساعات</th>
                  <th>إكمال</th>
                </tr>
              </thead>
              <tbody>
                {mcpTop.map(([name, hours, completion]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{hours}</td>
                    <td>{completion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          {index === 1 ? (
            <div className="chart-panel">
              <div className="chart-panel__head">
                <span className="chart-panel__title">
                  <BarChart3 size={12} aria-hidden="true" /> أكثر المجموعات نشاطاً — هذا الشهر
                </span>
                <Tag tone="soft">مثال توضيحي</Tag>
              </div>
              <GroupsChart paused={paused} />
            </div>
          ) : null}

          {index === 2 ? (
            <div className="mock__scenario rise">
              <span className="mock__scenario-title">
                <Wand2 aria-hidden="true" />
                محاكاة: تفاوض تجديد العقد
              </span>
              <div className="mock__chips">
                <span className="mock__chip">الهدف: الحفاظ على الهامش</span>
                <span className="mock__chip">الدور: موظف مبيعات × عميل متردد</span>
                <span className="mock__chip">المستوى: متقدم</span>
              </div>
              <div className="mock__steps">
                {scenarioSteps.map((step, stepIndex) => (
                  <span className="mock__step" key={step}>
                    <span className="mock__step-num">{stepIndex + 1}</span>
                    {step}
                  </span>
                ))}
              </div>
              <span className="mock__ready">
                <Check aria-hidden="true" /> جاهز خلال ثوانٍ — يمكن إسناده للمجموعة
              </span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="mock__foot">
        <span>{index === 1 ? 'تقرير جماعي جاهز للقراءة' : index === 2 ? 'سيناريو مبني على تحديك' : 'تقرير جاهز خلال ثوانٍ'}</span>
        <span>مثال توضيحي</span>
      </div>
    </div>
  )
}

const tabIcons = { sim: Bot, lesson: BookOpenCheck, mcp: Network } as const

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
    }, 12_000)
    return () => window.clearInterval(timer)
  }, [reduce, auto, paused])

  return (
    <section className="section ai" id="ai">
      <div className="ma-container" ref={ref}>
        <SecHead index="07" title={ai.title} lead={ai.lead} />

        <Tabs.Root
          value={value}
          dir="rtl"
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
            const Mock = tab.id === 'sim' ? SimMock : tab.id === 'lesson' ? LessonMock : McpMock
            return (
              <Tabs.Content value={tab.id} className="ai__panel" key={tab.id}>
                <Reveal className="ai__copy">
                  <Tag tone="coral">0{ai.tabs.findIndex((item) => item.id === tab.id) + 1}</Tag>
                  <h3>{tab.title}</h3>
                  <p>{tab.body}</p>
                  <ul className="ai__bullets">
                    {tab.bullets.map((bullet, index) => {
                      const Icon = bulletIcons[index] ?? Sparkles
                      return (
                        <li key={bullet}>
                          <Icon aria-hidden="true" />
                          {bullet}
                        </li>
                      )
                    })}
                  </ul>
                  {tab.id === 'sim' ? (
                    <span className="ai-coach-badge">
                      <BadgeCheck aria-hidden="true" />
                      كوتش AI مبني على مراجع علمية وعملية من ماستري
                    </span>
                  ) : null}
                </Reveal>
                <Reveal className="ai__mock" delay={0.08}>
                  <Mock paused={paused} />
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
