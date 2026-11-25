import {
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Bot,
  Check,
  FileBarChart,
  Gauge,
  GraduationCap,
  Info,
  ListChecks,
  MessageSquare,
  Network,
  Quote,
  Radio,
  Sparkles,
  Target,
  Timer,
  ShieldCheck,
  UsersRound,
  Wand2,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import type { ToolCallItem } from '@/components/kokonutui/ai-tool-calls'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ai, demoPeople } from '../content/ar'
import { formatNumber } from '../lib/format'
import { useDemoSequence } from '../motion/useDemoSequence'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterChars } from '../motion/TypewriterText'
import { Reveal } from '../motion/Reveal'
import { ChartContainer, ChartTooltip, ChartTooltipContent, kitColor } from '../ui/chart'
import { SecHead } from '../ui/SecHead'
import { Avatar } from '../ui/Avatar'
import { ScrollArrows } from '../ui/ScrollArrows'
import { AgentRun, agentRunMs } from '../ui/AgentRun'
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

type MockProps = { paused: boolean; onCycle?: () => void; onProgress?: (value: number) => void }

type Sequence = ReturnType<typeof useDemoSequence>

function MockPrompt({ demo }: { demo: Sequence }) {
  return (
    <div className="mock__prompt">
      <Sparkles aria-hidden="true" />
      <TypewriterChars text={demo.text} ghosts={demo.ghosts} caret={demo.phase === 'typing'} phase={demo.typePhase} />
      <span className="sr-only" aria-live="polite">
        {demo.resultVisible ? demo.prompt : ''}
      </span>
    </div>
  )
}

/** Nothing while the prompt types; then the agent's tasks stream in, fold, and the answer shows. */
function MockStage({ demo, calls, children }: { demo: Sequence; calls: readonly ToolCallItem[]; children: ReactNode }) {
  return (
    <AgentRun active={demo.phase === 'working' || demo.phase === 'showing'} runKey={demo.resultKey} calls={calls}>
      <div className="mock__answer">{children}</div>
    </AgentRun>
  )
}

const ic = (Icon: typeof Bot) => <Icon aria-hidden="true" />

const simCalls: ToolCallItem[] = [
  { id: 'scenario', tool: 'load_scenario', icon: ic(Bot), tone: 'sky', running: 'يجهّز العميل الافتراضي', done: 'جهّز العميل الافتراضي', detail: 'اعتراض السعر', result: 'تأمين', duration: 850 },
  { id: 'run', tool: 'run', icon: ic(Radio), tone: 'lilac', running: 'يدير الحوار', done: 'أدار الحوار', result: '4 ردود', duration: 950 },
  { id: 'score', tool: 'score', icon: ic(Gauge), tone: 'green', running: 'يقيّم الأداء', done: 'قيّم الأداء', result: '82 من 100', duration: 750 },
]

const lessonCalls: ToolCallItem[] = [
  { id: 'lesson', tool: 'read_lesson', icon: ic(BookOpenCheck), tone: 'sky', running: 'يقرأ الدرس', done: 'قرأ الدرس', detail: 'خدمة العملاء', result: '12 دقيقة', duration: 850 },
  { id: 'context', tool: 'read_context', icon: ic(UsersRound), tone: 'lilac', running: 'يربطه ببيئة عملك', done: 'ربطه ببيئة عملك', result: '3 أمثلة', duration: 900 },
  { id: 'quiz', tool: 'quiz', icon: ic(ListChecks), tone: 'coral', running: 'يجهّز سؤال تحقق', done: 'جهّز سؤال تحقق', result: 'جاهز', duration: 700 },
]

const mcpCalls: ToolCallItem[][] = [
  [
    { id: 'conn', tool: 'mcp_connect', icon: ic(Network), tone: 'sky', running: 'يتصل بماستري', done: 'اتصل بماستري', detail: 'MCP', result: 'آمن', duration: 700 },
    { id: 'hours', tool: 'query_hours', icon: ic(Timer), tone: 'lilac', running: 'يجمع ساعات التدريب', done: 'جمع ساعات التدريب', detail: 'هذا الشهر', result: '5 موظفين', duration: 900 },
  ],
  [
    { id: 'conn', tool: 'mcp_connect', icon: ic(Network), tone: 'sky', running: 'يتصل بماستري', done: 'اتصل بماستري', detail: 'MCP', result: 'آمن', duration: 700 },
    { id: 'groups', tool: 'query_groups', icon: ic(BarChart3), tone: 'lilac', running: 'يقارن المجموعات', done: 'قارن المجموعات', result: '4 مجموعات', duration: 900 },
  ],
  [
    { id: 'conn', tool: 'mcp_connect', icon: ic(Network), tone: 'sky', running: 'يتصل بماستري', done: 'اتصل بماستري', detail: 'MCP', result: 'آمن', duration: 700 },
    { id: 'gap', tool: 'read_gap', icon: ic(Target), tone: 'lilac', running: 'يقرأ فجوة التفاوض', done: 'قرأ فجوة التفاوض', result: 'المجموعة كاملة', duration: 850 },
    { id: 'build', tool: 'build_scenario', icon: ic(Wand2), tone: 'coral', running: 'يبني السيناريو', done: 'بنى السيناريو', result: '3 مراحل', duration: 900 },
  ],
]

function useMockSequence(prompts: readonly string[], { paused, onCycle, onProgress }: MockProps, showMs = 5200) {
  // Same rhythm as the demo + reports: quick typing, tasks, then time to read.
  const demo = useDemoSequence(prompts, { paused, onCycle, showMs, typeMs: 40, jitterMs: [26, 58], workingMs: 120, clearMs: 260 })
  useEffect(() => {
    onProgress?.(demo.progress)
  }, [demo.progress, onProgress])
  return demo
}

const simPrompts = ['درّب أحمد على اعتراض السعر، وسجّل تقييماً فورياً'] as const
const lessonPrompts = ['اشرح بأمثلة من بيئة عملي في خدمة العملاء'] as const

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

function SimMock(props: MockProps) {
  const demo = useMockSequence(simPrompts, props, agentRunMs(simCalls) + 5200)
  return (
    <div className="mock rise">
      <div className="mock__top">
        <span className="mock__brand">
          <Bot aria-hidden="true" /> محاكاة بيع · تأمين
        </span>
        <Tag tone="green" icon={<Radio aria-hidden="true" />}>مباشر</Tag>
      </div>
      <div className="mock__body">
        <MockPrompt demo={demo} />
        <div className="mock__result">
          <MockStage demo={demo} calls={simCalls}>
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
                style={{ animationDelay: `${index * 420}ms` }}
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
                <Tag tone="green" icon={<Check aria-hidden="true" />}>وضوح القيمة</Tag>
                <Tag tone="yellow" icon={<Target aria-hidden="true" />}>إغلاق</Tag>
              </div>
            </div>
          </div>
          </MockStage>
        </div>
      </div>
      <div className="mock__foot">
        <span>
          <MessageSquare aria-hidden="true" /> السيناريو: اعتراض على السعر
        </span>
        <span>
          <Info aria-hidden="true" /> مثال توضيحي
        </span>
      </div>
    </div>
  )
}

function LessonMock(props: MockProps) {
  const demo = useMockSequence(lessonPrompts, props, agentRunMs(lessonCalls) + 5000)
  return (
    <div className="mock rise">
      <div className="mock__top">
        <span className="mock__brand">
          <BookOpenCheck aria-hidden="true" /> الدرس 03 · إدارة الاعتراضات
        </span>
        <Tag tone="soft" icon={<GraduationCap aria-hidden="true" />}>كوتش الدرس</Tag>
      </div>
      <div className="mock__body">
        <MockPrompt demo={demo} />
        <div className="mock__result">
          <MockStage demo={demo} calls={lessonCalls}>
          <div className="res-chat rise">
            {lessonChat.map((line, index) => (
              <span
                className={line.who === 'user' ? 'bubble bubble--user' : 'bubble bubble--coach'}
                style={{ animationDelay: `${index * 420}ms` }}
                key={index}
              >
                {line.text}
              </span>
            ))}
          </div>
          <div className="res-rows">
            <div className="res-row">
              <span className="res-row__box res-row__box--done">
                <Check size={10} aria-hidden="true" />
              </span>
              <span className="res-row__name">اختبر فهمك: ما أول خطوة عند اعتراض السعر؟</span>
            </div>
            <div className="res-row">
              <span className="res-row__box" />
              <span className="res-row__name">اشرح بأمثلة من بيئة عملك</span>
              <span className="res-row__meta">
                <ListChecks size={11} aria-hidden="true" /> 2 خيارات
              </span>
            </div>
          </div>
          </MockStage>
        </div>
      </div>
      <div className="mock__foot">
        <span>
          <Zap aria-hidden="true" /> إجابة فورية داخل الدرس
        </span>
        <span>
          <Info aria-hidden="true" /> مثال توضيحي
        </span>
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

const mcpTop = [...demoPeople].sort((a, b) => b.hours - a.hours).slice(0, 5)

function McpMock(props: MockProps) {
  const demo = useMockSequence(mcpPrompts, props, Math.max(...mcpCalls.map(agentRunMs)) + 4800)
  const index = demo.step

  return (
    <div className="mock rise">
      <div className="mock__top">
        <span className="mock__brand">
          <Network aria-hidden="true" /> Claude · MCP
        </span>
        <Tag tone="purple" icon={<ShieldCheck aria-hidden="true" />}>اتصال آمن</Tag>
      </div>
      <div className="mock__body">
        <MockPrompt demo={demo} />
        <div className="mock__result">
          <MockStage demo={demo} calls={mcpCalls[index] ?? mcpCalls[0]}>
            {index === 0 ? (
              <Table className="mock__table">
                <TableHeader>
                  <TableRow>
                    <TableHead>موظف المبيعات</TableHead>
                    <TableHead>ساعات</TableHead>
                    <TableHead>إكمال</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcpTop.map((person, rowIndex) => (
                    <TableRow key={person.id} style={{ animationDelay: `${rowIndex * 70}ms` }}>
                      <TableCell>
                        <span className="mock__person">
                          <Avatar initial={person.initial} tone={person.tone} size={18} />
                          {person.name}
                        </span>
                      </TableCell>
                      <TableCell dir="ltr">{formatNumber(person.hours)}</TableCell>
                      <TableCell dir="ltr">{person.completion}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}

            {index === 1 ? (
              <div className="chart-panel">
                <div className="chart-panel__head">
                  <span className="chart-panel__title">
                    <BarChart3 size={12} aria-hidden="true" /> أكثر المجموعات نشاطاً — هذا الشهر
                  </span>
                  <Tag tone="soft" icon={<Info aria-hidden="true" />}>مثال توضيحي</Tag>
                </div>
                <GroupsChart paused={props.paused} />
              </div>
            ) : null}

            {index === 2 ? (
              <div className="mock__scenario rise">
                <span className="mock__scenario-title">
                  <Wand2 aria-hidden="true" />
                  محاكاة: تفاوض تجديد العقد
                </span>
                <div className="mock__chips">
                  <span className="mock__chip">
                    <Target aria-hidden="true" /> الهدف: الحفاظ على الهامش
                  </span>
                  <span className="mock__chip">
                    <UsersRound aria-hidden="true" /> الدور: موظف مبيعات × عميل متردد
                  </span>
                  <span className="mock__chip">
                    <Gauge aria-hidden="true" /> المستوى: متقدم
                  </span>
                </div>
                <div className="mock__steps">
                  {scenarioSteps.map((step, stepIndex) => (
                    <span className="mock__step" key={step} style={{ animationDelay: `${stepIndex * 140}ms` }}>
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
          </MockStage>
        </div>
      </div>
      <div className="mock__foot">
        <span>
          <FileBarChart aria-hidden="true" />
          {index === 1 ? 'تقرير جماعي جاهز للقراءة' : index === 2 ? 'سيناريو مبني على تحديك' : 'تقرير جاهز خلال ثوانٍ'}
        </span>
        <span>
          <Info aria-hidden="true" /> مثال توضيحي
        </span>
      </div>
    </div>
  )
}

const tabIcons = { sim: Bot, lesson: BookOpenCheck, mcp: Network } as const

export function AI() {
  const reduce = useReducedMotion()
  const [value, setValue] = useState('sim')
  const [progress, setProgress] = useState(0)
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.3 })
  const tabsRef = useRef<HTMLDivElement>(null)

  // On narrow screens keep the active tab scrolled into view as the tabs rotate.
  useEffect(() => {
    const list = tabsRef.current
    const trigger = list?.querySelector<HTMLElement>('[data-state="active"]')
    if (!list || !trigger || list.scrollWidth <= list.clientWidth) return
    const listBox = list.getBoundingClientRect()
    const box = trigger.getBoundingClientRect()
    const delta = box.left + box.width / 2 - (listBox.left + listBox.width / 2)
    list.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' })
  }, [value, reduce])

  // A tab moves on once its demo has played a full cycle, so a prompt is never cut off.
  const nextTab = useCallback(() => {
    if (reduce) return
    setValue((current) => {
      const index = ai.tabs.findIndex((tab) => tab.id === current)
      return ai.tabs[(index + 1) % ai.tabs.length]?.id ?? 'sim'
    })
  }, [reduce])

  return (
    <section className="section ai" id="ai">
      <div className="ma-container" ref={ref}>
        <SecHead index="07" title={ai.title} lead={ai.lead} icon={Bot} />

        <Tabs
          value={value}
          dir="rtl"
          onValueChange={(next) => {
            // A click jumps to that tab; the rotation keeps going from there.
            setValue(next)
          }}
        >
          <ScrollArrows scrollerRef={tabsRef} className="ai__tabs-wrap" label="حلول الذكاء الاصطناعي">
          <TabsList ref={tabsRef} className="ai__tabs" aria-label="حلول الذكاء الاصطناعي">
            {ai.tabs.map((tab, index) => {
              const Icon = tabIcons[tab.id as keyof typeof tabIcons]
              return (
                <TabsTrigger value={tab.id} className="ai-tab" key={tab.id}>
                  <Icon className="ai-tab__icon" aria-hidden="true" />
                  <span className="ai-tab__num">0{index + 1}</span>
                  {tab.label}
                </TabsTrigger>
              )
            })}
          </TabsList>
          </ScrollArrows>

          <div className="ai__progress-wrap" aria-hidden="true">
            {!reduce ? (
              <span className="ai__progress-run" style={{ transform: `scaleX(${progress})` }} />
            ) : null}
          </div>

          {ai.tabs.map((tab, tabIndex) => {
            const Mock = tab.id === 'sim' ? SimMock : tab.id === 'lesson' ? LessonMock : McpMock
            return (
              <TabsContent value={tab.id} className="ai__panel" key={tab.id}>
                <Reveal className="ai__copy">
                  <Tag tone="coral" icon={<Sparkles aria-hidden="true" />}>0{tabIndex + 1}</Tag>
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
                  <Mock paused={paused} onCycle={nextTab} onProgress={setProgress} />
                </Reveal>
              </TabsContent>
            )
          })}
        </Tabs>

        <p className="ai__extra">
          <Quote size={14} aria-hidden="true" className="ai__extra-icon" />
          {ai.extra}
        </p>
      </div>
    </section>
  )
}
