import NumberFlow from '@number-flow/react'
import {
  BarChart3,
  BookOpenCheck,
  Bot,
  Check,
  Gauge,
  GraduationCap,
  ListChecks,
  Network,
  Play,
  Quote,
  Radio,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  UsersRound,
  Wand2,
  type LucideIcon,
} from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { ToolCallItem } from '@/components/kokonutui/ai-tool-calls'
import { ai, demoPeople } from '../content/ar'
import { formatNumber } from '../lib/format'
import { cn } from '../lib/cx'
import { useDemoSequence } from '../motion/useDemoSequence'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterChars } from '../motion/TypewriterText'
import { AgentRun, agentRunMs } from '../ui/AgentRun'
import { Avatar } from '../ui/Avatar'
import { SecHead } from '../ui/SecHead'

const EASE = [0.22, 1, 0.36, 1] as const
const ic = (Icon: LucideIcon) => <Icon aria-hidden="true" />
const face = (n: number) => `/assets/avatars/a${String(n).padStart(2, '0')}.webp`

type TabId = (typeof ai.tabs)[number]['id']
type ModelId = (typeof ai.models)[number]['id']
type Sequence = ReturnType<typeof useDemoSequence>
type MockProps = { paused: boolean; onCycle: () => void; onProgress: (value: number) => void }

/* ───────────── shared: the agent rhythm (type → tasks → answer) ───────────── */

function useMock(prompts: readonly string[], { paused, onCycle, onProgress }: MockProps, showMs: number) {
  const demo = useDemoSequence(prompts, { paused, onCycle, showMs, typeMs: 40, jitterMs: [26, 58], workingMs: 120, clearMs: 260 })
  useEffect(() => onProgress(demo.progress), [demo.progress, onProgress])
  return demo
}

function Prompt({ demo, placeholder, lead }: { demo: Sequence; placeholder: string; lead?: ReactNode }) {
  return (
    <div className="aix-prompt">
      {lead ?? <Sparkles className="aix-prompt__icon" aria-hidden="true" />}
      <span className="aix-prompt__text">
        {demo.text ? (
          <TypewriterChars text={demo.text} ghosts={demo.ghosts} caret={demo.phase === 'typing'} phase={demo.typePhase} />
        ) : (
          <span className="aix-prompt__placeholder">{placeholder}</span>
        )}
      </span>
      <span className="sr-only" aria-live="polite">
        {demo.resultVisible ? demo.prompt : ''}
      </span>
    </div>
  )
}

function Stage({ demo, calls, children }: { demo: Sequence; calls: readonly ToolCallItem[]; children: ReactNode }) {
  return (
    <div className="aix-result">
      <AgentRun active={demo.phase === 'working' || demo.phase === 'showing'} runKey={demo.resultKey} calls={calls}>
        {children}
      </AgentRun>
    </div>
  )
}

const pop = (delay: number) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.36, ease: EASE, delay },
})

/** Counts up from 0 once mounted (NumberFlow rolls the digits). */
function useCountUp(value: number, delay = 150) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (reduce) return
    const id = window.setTimeout(() => setShown(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay, reduce])
  return reduce ? value : shown
}

/* ───────────── 01 · simulation ───────────── */

const simCalls: ToolCallItem[] = [
  { id: 'scenario', tool: 'load_scenario', icon: ic(Bot), tone: 'sky', running: 'يجهّز العميل الافتراضي', done: 'جهّز العميل الافتراضي', detail: 'اعتراض السعر', duration: 800 },
  { id: 'run', tool: 'run', icon: ic(Radio), tone: 'lilac', running: 'يدير الحوار', done: 'أدار الحوار', result: '4 ردود', duration: 900 },
  { id: 'score', tool: 'score', icon: ic(Gauge), tone: 'green', running: 'يقيّم الأداء', done: 'قيّم الأداء', result: '82 من 100', duration: 700 },
]
const simChat = [
  { who: 'them', text: 'السعر أعلى من الميزانية… لماذا أدفع أكثر؟' },
  { who: 'me', text: 'أتفهم ذلك. كم يكلّفكم كل شهر تأخير في حل المشكلة؟' },
  { who: 'coach', text: 'ممتاز: وضّحت العائد قبل أي خصم.' },
] as const
const simSkills = [
  { label: 'وضوح القيمة', value: 88 },
  { label: 'الإنصات', value: 79 },
  { label: 'الإغلاق', value: 64 },
]

function ScoreRing({ value }: { value: number }) {
  const shown = useCountUp(value)
  const r = 52
  const c = 2 * Math.PI * r
  return (
    <div className="aix-ring">
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle className="aix-ring__track" cx="60" cy="60" r={r} />
        <motion.circle
          className="aix-ring__bar"
          cx="60"
          cy="60"
          r={r}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - shown / 100) }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </svg>
      <b dir="ltr">
        <NumberFlow value={shown} locales="en-US" />
      </b>
      <span>من 100</span>
    </div>
  )
}

function SimMock(props: MockProps) {
  const demo = useMock(['درّب أحمد على اعتراض السعر، وقيّم ردوده فوراً'], props, agentRunMs(simCalls) + 5600)
  return (
    <>
      <Prompt demo={demo} placeholder="اطلب محاكاة…" />
      <Stage demo={demo} calls={simCalls}>
        <div className="aix-split">
          <div className="aix-chat">
            {simChat.map((line, i) => (
              <motion.div className={`aix-bubble aix-bubble--${line.who}`} key={line.text} {...pop(0.15 + i * 0.45)}>
                {line.who === 'them' ? <img className="aix-face" src={face(6)} alt="" width={30} height={30} /> : null}
                {line.who === 'coach' ? (
                  <span className="aix-face aix-face--coach">
                    <Bot aria-hidden="true" />
                  </span>
                ) : null}
                <p>{line.text}</p>
              </motion.div>
            ))}
          </div>
          <motion.div className="aix-score" {...pop(0.5)}>
            <ScoreRing value={82} />
            <ul className="aix-skills">
              {simSkills.map((skill, i) => (
                <li key={skill.label}>
                  <span>{skill.label}</span>
                  <span className="aix-bar">
                    <motion.i
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: skill.value / 100 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.7 + i * 0.12 }}
                    />
                  </span>
                  <b dir="ltr">{skill.value}</b>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Stage>
    </>
  )
}

/* ───────────── 02 · lesson coach ───────────── */

const lessonCalls: ToolCallItem[] = [
  { id: 'lesson', tool: 'read_lesson', icon: ic(BookOpenCheck), tone: 'sky', running: 'يقرأ الدرس', done: 'قرأ الدرس', detail: 'إدارة الاعتراضات', duration: 800 },
  { id: 'context', tool: 'read_context', icon: ic(UsersRound), tone: 'lilac', running: 'يربطه ببيئة عملك', done: 'ربطه ببيئة عملك', result: '3 أمثلة', duration: 850 },
  { id: 'quiz', tool: 'quiz', icon: ic(ListChecks), tone: 'coral', running: 'يجهّز سؤال تحقق', done: 'جهّز سؤال تحقق', duration: 650 },
]

function LessonMock(props: MockProps) {
  const demo = useMock(['اشرح اعتراض السعر بمثال من خدمة العملاء'], props, agentRunMs(lessonCalls) + 5400)
  return (
    <>
      <Prompt demo={demo} placeholder="اسأل عن الدرس…" />
      <Stage demo={demo} calls={lessonCalls}>
        <div className="aix-split">
          <motion.div className="aix-lesson" {...pop(0.1)}>
            <div className="aix-lesson__thumb">
              <span>
                <Play aria-hidden="true" />
              </span>
            </div>
            <b>الدرس 03 · إدارة الاعتراضات</b>
            <span className="aix-bar aix-bar--wide">
              <motion.i initial={{ scaleX: 0 }} animate={{ scaleX: 0.42 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }} />
            </span>
            <small dir="ltr">04:12 / 09:30</small>
          </motion.div>
          <div className="aix-chat">
            <motion.div className="aix-bubble aix-bubble--coach" {...pop(0.35)}>
              <span className="aix-face aix-face--coach">
                <GraduationCap aria-hidden="true" />
              </span>
              <p>عميل يقول «الباقة غالية»؟ اسأله أولاً عن المشكلة التي يريد حلها، ثم اربط السعر بالنتيجة.</p>
            </motion.div>
            <motion.div className="aix-quiz" {...pop(1.1)}>
              <span className="aix-quiz__q">
                <ListChecks aria-hidden="true" /> اختبر فهمك
              </span>
              <p>ما أول خطوة عند اعتراض السعر؟</p>
              {['أعرض خصماً فورياً', 'أسأل عن تكلفة المشكلة'].map((option, i) => (
                <motion.span
                  className={cn('aix-quiz__opt', i === 1 && 'is-right')}
                  key={option}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4 + i * 0.15 }}
                >
                  {i === 1 ? (
                    <motion.span
                      className="aix-quiz__tick"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 2.4, type: 'spring', stiffness: 420, damping: 18 }}
                    >
                      <Check aria-hidden="true" />
                    </motion.span>
                  ) : (
                    <span className="aix-quiz__dot" />
                  )}
                  {option}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </div>
      </Stage>
    </>
  )
}

/* ───────────── 03 · run the academy from Claude / ChatGPT / Gemini ───────────── */

const mcpPrompts = [
  'من أكثر 5 موظفي مبيعات نشاطاً هذا الشهر؟',
  'ما هي أكثر المجموعات نشاطاً؟',
  'نواجه تحدياً في التفاوض، ابنِ سيناريو محاكاة للمجموعة',
] as const
/** Which assistant asks each prompt, so all three take a turn. */
const promptModel: ModelId[] = ['claude', 'chatgpt', 'gemini']

const connect = (name: string): ToolCallItem => ({
  id: 'conn', tool: 'mcp_connect', icon: ic(Network), tone: 'sky', running: `${name} يتصل بماستري`, done: `${name} اتصل بماستري`, detail: 'MCP', result: 'آمن', duration: 700,
})
const mcpCalls: ToolCallItem[][] = [
  [connect('Claude'), { id: 'hours', tool: 'query_hours', icon: ic(Timer), tone: 'lilac', running: 'يجمع ساعات التدريب', done: 'جمع ساعات التدريب', result: '5 موظفين', duration: 850 }],
  [connect('ChatGPT'), { id: 'groups', tool: 'query_groups', icon: ic(BarChart3), tone: 'lilac', running: 'يقارن المجموعات', done: 'قارن المجموعات', result: '4 مجموعات', duration: 850 }],
  [
    connect('Gemini'),
    { id: 'gap', tool: 'read_gap', icon: ic(Target), tone: 'lilac', running: 'يقرأ فجوة التفاوض', done: 'قرأ فجوة التفاوض', duration: 750 },
    { id: 'build', tool: 'build_scenario', icon: ic(Wand2), tone: 'coral', running: 'يبني السيناريو', done: 'بنى السيناريو', result: '3 مراحل', duration: 850 },
  ],
]

const mcpTop = [...demoPeople].sort((a, b) => b.hours - a.hours).slice(0, 5)
const groupRows = [
  { name: 'المبيعات · الرياض', value: 92 },
  { name: 'خدمة العملاء · جدة', value: 86 },
  { name: 'الموارد البشرية · القاهرة', value: 74 },
  { name: 'المبيعات · الدمام', value: 63 },
]
const scenarioSteps = ['افتح بسؤال عن وضع العقد الحالي', 'اعرض تكلفة التأخير قبل السعر', 'اختم بخيارين وخطوة تالية']

function ModelLogo({ id, size = 22 }: { id: ModelId; size?: number }) {
  const model = ai.models.find((m) => m.id === id) ?? ai.models[0]
  return <img className="aix-logo" src={model.logo} alt="" width={size} height={size} />
}

type Link = { d: string; x1: number; x2: number; y1: number; y2: number }

/** A smooth S-curve between two anchors (horizontal tangents at both ends). */
function curve(x1: number, y1: number, x2: number, y2: number): Link {
  const mx = (x1 + x2) / 2
  return { d: `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, x1, y1, x2, y2 }
}

const hubData: { label: string; Icon: LucideIcon }[] = [
  { label: 'الموظفون', Icon: UsersRound },
  { label: 'المجموعات', Icon: BarChart3 },
  { label: 'المحاكاة', Icon: Bot },
]

/**
 * Assistants on one side, Mastery in the middle, your academy's data on the
 * other. Every line is measured from the real node edges, so it always meets
 * them. Model i and data node i belong to question i; clicking either one
 * plays that question.
 */
function ConnectHub({ active, onPick }: { active: number; onPick: (index: number) => void }) {
  const hubRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const modelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const dataRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [links, setLinks] = useState<{ inbound: Link[]; outbound: Link[]; w: number; h: number }>({ inbound: [], outbound: [], w: 0, h: 0 })
  const gradId = useId().replace(/:/g, '')

  useLayoutEffect(() => {
    const hub = hubRef.current
    const core = coreRef.current
    if (!hub || !core) return
    const measure = () => {
      const o = hub.getBoundingClientRect()
      const c = core.getBoundingClientRect()
      const cy = c.top + c.height / 2 - o.top
      // Three ports on each side of the core, so the lines don't all pile onto one point.
      const port = (i: number) => cy + (i - 1) * Math.min(14, c.height / 5)
      const ltr = getComputedStyle(hub).direction === 'ltr'
      const inbound = modelRefs.current.map((el, i) => {
        const r = el?.getBoundingClientRect()
        if (!r) return curve(0, 0, 0, 0)
        const from = (ltr ? r.right : r.left) - o.left
        const to = (ltr ? c.left : c.right) - o.left
        return curve(from, r.top + r.height / 2 - o.top, to, port(i))
      })
      const outbound = dataRefs.current.map((el, i) => {
        const r = el?.querySelector('.aix-hub__data-icon')?.getBoundingClientRect()
        if (!r) return curve(0, 0, 0, 0)
        const from = (ltr ? c.right : c.left) - o.left
        const to = (ltr ? r.left : r.right) - o.left
        return curve(from, port(i), to, r.top + r.height / 2 - o.top)
      })
      setLinks({ inbound, outbound, w: o.width, h: o.height })
    }
    measure()
    // Re-measure whenever a node column changes size (web font swap, resize) and once the stage has settled.
    const observer = new ResizeObserver(measure)
    observer.observe(hub)
    hub.querySelectorAll('.aix-hub__models, .aix-hub__data, .aix-hub__core').forEach((el) => observer.observe(el))
    void document.fonts?.ready.then(measure)
    const settle = window.setTimeout(measure, 450)
    return () => {
      observer.disconnect()
      window.clearTimeout(settle)
    }
  }, [])

  const renderLink = (link: Link, key: string, on: boolean) => (
    <g key={key} className={cn('aix-hub__link', on && 'is-active')}>
      <linearGradient id={`${gradId}-${key}`} gradientUnits="userSpaceOnUse" x1={link.x1} y1={link.y1} x2={link.x2} y2={link.y2}>
        <stop offset="0" stopColor="var(--coral)" />
        <stop offset="1" stopColor="var(--yellow)" />
      </linearGradient>
      <path className="aix-hub__base" d={link.d} />
      {on ? (
        <>
          <path className="aix-hub__flow" d={link.d} stroke={`url(#${gradId}-${key})`} />
          <circle className="aix-hub__comet" r="3.5">
            <animateMotion dur="1.6s" repeatCount="indefinite" path={link.d} />
          </circle>
        </>
      ) : null}
      <circle className="aix-hub__port" cx={link.x1} cy={link.y1} r="3" />
      <circle className="aix-hub__port" cx={link.x2} cy={link.y2} r="3" />
    </g>
  )

  return (
    <div className="aix-hub" ref={hubRef}>
      {links.w > 0 ? (
        <svg className="aix-hub__svg" width={links.w} height={links.h} viewBox={`0 0 ${links.w} ${links.h}`} aria-hidden="true">
          {links.inbound.map((link, i) => renderLink(link, `in${i}`, i === active))}
          {links.outbound.map((link, i) => renderLink(link, `out${i}`, i === active))}
        </svg>
      ) : null}

      <div className="aix-hub__models" role="group" aria-label="المساعدات">
        {ai.models.map((model, i) => (
          <button
            type="button"
            className={cn('aix-hub__model', i === active && 'is-active')}
            key={model.id}
            aria-pressed={i === active}
            onClick={() => onPick(i)}
          >
            {/* Name on the outer side, logo on the inner side where its line starts. */}
            <span className="aix-hub__name">{model.name}</span>
            <span
              className="aix-hub__chip"
              ref={(el) => {
                modelRefs.current[i] = el
              }}
            >
              <ModelLogo id={model.id} />
            </span>
          </button>
        ))}
      </div>

      <div className="aix-hub__core" ref={coreRef}>
        <img src="/assets/logos/ma-logo-coral-ink.svg" alt="" className="aix-hub__core-logo aix-hub__core-logo--light" />
        <img src="/assets/logos/ma-logo-white.svg" alt="" className="aix-hub__core-logo aix-hub__core-logo--dark" />
        <span>MCP</span>
      </div>

      <div className="aix-hub__data" role="group" aria-label="بيانات أكاديميتك">
        {hubData.map(({ label, Icon }, i) => (
          <button
            type="button"
            className={cn('aix-hub__datum', i === active && 'is-active')}
            key={label}
            aria-pressed={i === active}
            aria-label={label}
            onClick={() => onPick(i)}
            ref={(el) => {
              dataRefs.current[i] = el
            }}
          >
            <span className="aix-hub__data-icon">
              <Icon aria-hidden="true" />
            </span>
            <span className="aix-hub__data-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function McpMock(props: MockProps & { onModel: (id: ModelId) => void }) {
  const demo = useMock(mcpPrompts, props, Math.max(...mcpCalls.map(agentRunMs)) + 5000)
  const index = demo.step
  const model = promptModel[index] ?? 'claude'
  const { onModel } = props
  useEffect(() => onModel(model), [model, onModel])
  const name = ai.models.find((m) => m.id === model)?.name ?? 'Claude'

  return (
    <>
      <ConnectHub active={index} onPick={(i) => demo.goTo(i)} />
      <Prompt demo={demo} placeholder={`اسأل ${name}…`} lead={<ModelLogo id={model} size={20} />} />
      <Stage demo={demo} calls={mcpCalls[index] ?? mcpCalls[0]}>
        {index === 0 ? (
          <ul className="aix-people">
            {mcpTop.map((person, i) => (
              <motion.li key={person.id} {...pop(0.08 * i)}>
                <span className="aix-people__rank" dir="ltr">
                  {i + 1}
                </span>
                <Avatar initial={person.initial} tone={person.tone} size={30} />
                <b>{person.name}</b>
                <span className="aix-bar">
                  <motion.i
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: person.completion / 100 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.08 }}
                  />
                </span>
                <small dir="ltr">{formatNumber(person.hours)} س</small>
              </motion.li>
            ))}
          </ul>
        ) : null}

        {index === 1 ? (
          <div className="aix-groups">
            {groupRows.map((row, i) => (
              <motion.div className="aix-groups__col" key={row.name} {...pop(0.08 * i)}>
                <span className="aix-groups__track">
                  <motion.i
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: row.value / 100 }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.1 }}
                  />
                </span>
                <b dir="ltr">{row.value}%</b>
                <small>{row.name}</small>
              </motion.div>
            ))}
          </div>
        ) : null}

        {index === 2 ? (
          <div className="aix-scenario">
            <motion.b {...pop(0)}>
              <Wand2 aria-hidden="true" /> محاكاة: تفاوض تجديد العقد
            </motion.b>
            <ol>
              {scenarioSteps.map((step, i) => (
                <motion.li key={step} {...pop(0.25 + i * 0.2)}>
                  <span dir="ltr">{i + 1}</span>
                  {step}
                </motion.li>
              ))}
            </ol>
            <motion.span className="aix-scenario__ready" {...pop(1)}>
              <Check aria-hidden="true" /> جاهز للإسناد للمجموعة
            </motion.span>
          </div>
        ) : null}
      </Stage>
    </>
  )
}

/* ───────────── section ───────────── */

const tabIcons: Record<TabId, LucideIcon> = { sim: Bot, lesson: BookOpenCheck, mcp: Network }

export function AI() {
  const reduce = useReducedMotion()
  const [tab, setTab] = useState<TabId>('sim')
  const [progress, setProgress] = useState(0)
  const [model, setModel] = useState<ModelId>('claude')
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.3 })
  const railRef = useRef<HTMLDivElement>(null)

  const index = ai.tabs.findIndex((t) => t.id === tab)
  const current = ai.tabs[index] ?? ai.tabs[0]

  // A tab moves on once its demo has played a full cycle, so a prompt is never cut off.
  const onCycle = useCallback(() => {
    if (reduce) return
    setTab((cur) => {
      const at = ai.tabs.findIndex((t) => t.id === cur)
      return ai.tabs[(at + 1) % ai.tabs.length].id
    })
  }, [reduce])
  const [onProgress] = useState(() => (value: number) => setProgress(value))
  const [onModel] = useState(() => (id: ModelId) => setModel(id))

  // Phones: keep the active pill in view.
  useEffect(() => {
    const rail = railRef.current
    const item = rail?.children[index] as HTMLElement | undefined
    if (!rail || !item || rail.scrollWidth <= rail.clientWidth) return
    rail.scrollTo({ left: item.offsetLeft - (rail.clientWidth - item.offsetWidth) / 2, behavior: 'smooth' })
  }, [index])

  const mockProps = { paused, onCycle, onProgress }

  return (
    <section className="section ai aix" id="ai">
      <div className="ma-container" ref={ref}>
        <SecHead index="07" title={ai.title} lead={ai.lead} icon={Bot} center />

        <div className="demo-rail-wrap aix-rail-wrap">
          <div className="demo-rail" role="tablist" aria-label="حلول الذكاء الاصطناعي" ref={railRef}>
            {ai.tabs.map((t) => {
              const Icon = tabIcons[t.id]
              const active = t.id === tab
              return (
                <button
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="aix-stage"
                  className={active ? 'demo-rail__item is-active' : 'demo-rail__item'}
                  key={t.id}
                  onClick={() => setTab(t.id)}
                >
                  {active ? (
                    <motion.span
                      layoutId="aix-rail-glider"
                      className="demo-rail__glider"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      aria-hidden="true"
                    >
                      {!reduce ? <span className="aix-rail__timer" style={{ transform: `scaleX(${progress})` }} /> : null}
                    </motion.span>
                  ) : null}
                  <span className="demo-rail__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="demo-rail__label">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="aix-head" key={current.id}>
          <h3>
            {current.title}
            {current.id === 'mcp' ? (
              <span className="aix-models">
                {ai.models.map((m) => (
                  <span className={cn('aix-models__item', m.id === model && 'is-active')} key={m.id}>
                    <ModelLogo id={m.id} size={20} />
                    {m.name}
                  </span>
                ))}
              </span>
            ) : null}
          </h3>
          <p>{current.short}</p>
          <ul className="aix-chips">
            {current.chips.map((chip) => (
              <li key={chip}>
                {current.id === 'mcp' && chip === 'صلاحيات الشركة' ? <ShieldCheck aria-hidden="true" /> : <Check aria-hidden="true" />}
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="focus-glow aix-stage-wrap">
          <div className="aix-stage" id="aix-stage" role="tabpanel" aria-label={current.label} key={current.id}>
            {current.id === 'sim' ? <SimMock {...mockProps} /> : null}
            {current.id === 'lesson' ? <LessonMock {...mockProps} /> : null}
            {current.id === 'mcp' ? <McpMock {...mockProps} onModel={onModel} /> : null}
            <span className="aix-stage__note">مثال توضيحي</span>
          </div>
        </div>

        <p className="ai__extra">
          <Quote size={14} aria-hidden="true" className="ai__extra-icon" />
          {ai.extra}
        </p>
      </div>
    </section>
  )
}
