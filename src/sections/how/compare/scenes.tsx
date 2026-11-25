import NumberFlow from '@number-flow/react'
import {
  BarChart3,
  Bot,
  Clock,
  Gauge,
  LayoutDashboard,
  MessageSquareText,
  Play,
  RotateCcw,
  Sparkles,
  Stethoscope,
  Target,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { animate, motion, useReducedMotion } from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import AppleActivityCard from '@/components/kokonutui/apple-activity-card'
import type { ToolCallItem } from '@/components/kokonutui/ai-tool-calls'
import ProgressTracker from '@/components/kokonutui/currency-transfer'
import MetricCard from '@/components/kokonutui/metric-card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TypewriterChars } from '../../../motion/TypewriterText'
import { AgentRun } from '../../../ui/AgentRun'
import { cn } from '../../../lib/cx'
import {
  avatar,
  coachChat,
  costCover,
  costItems,
  employees,
  followSteps,
  hoursData,
  hoursEvents,
  hoursSegments,
  teamPaths,
} from './data'

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * The scene's clock: how many of the given moments (ms after mount) have
 * passed. Scenes are keyed per run, so mounting again replays them; reduced
 * motion jumps straight to the last beat.
 */
function useBeats(times: readonly number[]) {
  const reduce = useReducedMotion()
  const [beat, setBeat] = useState(0)
  const timesRef = useRef(times)
  useEffect(() => {
    if (reduce) return
    const ids = timesRef.current.map((t, i) => window.setTimeout(() => setBeat((b) => Math.max(b, i + 1)), t))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [reduce])
  return reduce ? times.length : beat
}

/** Types `text` from `startMs`, one character every ~`charMs`. */
function useTyped(text: string, startMs: number, charMs = 42) {
  const reduce = useReducedMotion()
  const chars = Array.from(text)
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (reduce) return
    let timer = 0
    let n = 0
    const tick = () => {
      n += 1
      setCount(n)
      if (n < chars.length) timer = window.setTimeout(tick, charMs + Math.random() * 30)
    }
    timer = window.setTimeout(tick, startMs)
    return () => window.clearTimeout(timer)
  }, [reduce, chars.length, startMs, charMs])
  const shown = reduce ? chars.length : count
  return { text: chars.slice(0, shown).join(''), done: shown >= chars.length, started: shown > 0 }
}

function Person({ src, name, size = 28 }: { src: string; name: string; size?: number }) {
  return (
    <Avatar className="cmp-avatar" style={{ width: size, height: size }}>
      <AvatarImage src={src} alt="" width={size} height={size} loading="lazy" />
      <AvatarFallback>{name.charAt(0)}</AvatarFallback>
    </Avatar>
  )
}

const rise = (on: boolean, delay = 0) => ({
  initial: { opacity: 0, y: 8 },
  animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
  transition: { duration: 0.36, ease: EASE, delay },
})

/* ───────────── 0 · الوقت ───────────── */
export function TimeScene() {
  return (
    <div className="cmp-scene cmp-time">
      <AppleActivityCard
        className="cmp-time__card"
        activities={[
          { label: 'دقائق التعلم اليوم', color: '#ff6555', colorEnd: '#ff9a8f', size: 176, current: 15, target: 15, unit: 'دقيقة' },
          { label: 'أيام التعلم هذا الشهر', color: '#ffb23f', colorEnd: '#ffd27a', size: 136, current: 18, target: 20, unit: 'يوماً' },
          { label: 'مهارات طُبّقت في الميدان', color: '#2d8fcb', colorEnd: '#6cb8e6', size: 96, current: 4, target: 3, unit: 'مهارات' },
        ]}
      />
      <p className="cmp-note">
        <Clock aria-hidden="true" />
        بين مكالمة وأخرى، دون يوم واحد خارج الميدان
      </p>
    </div>
  )
}

/* ───────────── 1 · المواءمة ───────────── */
export function FitScene() {
  const beat = useBeats([150, 700, 1300, 1900])
  const linksRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const node = linksRef.current
    if (!node) return
    const measure = () => setWidth(node.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  // Right-to-left: the first team sits on the right.
  const xs = [5 / 6, 1 / 2, 1 / 6].map((f) => f * width)
  const H = 44

  return (
    <div className="cmp-scene cmp-fit">
      <motion.div className="cmp-fit__root" {...rise(beat >= 1)}>
        <Stethoscope aria-hidden="true" />
        تشخيص الفريق
        <span className="cmp-fit__root-meta">48 موظفاً · 4 مهارات</span>
      </motion.div>

      <div className="cmp-fit__links" ref={linksRef} aria-hidden="true">
        {width > 0 ? (
          <svg width={width} height={H} viewBox={`0 0 ${width} ${H}`}>
            {xs.map((x, i) => (
              <motion.path
                key={i}
                d={`M${width / 2} 0 C ${width / 2} ${H * 0.62}, ${x} ${H * 0.38}, ${x} ${H}`}
                className="cmp-fit__link"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: beat >= 2 ? 1 : 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
              />
            ))}
          </svg>
        ) : null}
      </div>

      <div className="cmp-fit__cols">
        {teamPaths.map((path, i) => (
          <div className="cmp-fit__col" key={path.team}>
            <motion.div className="cmp-fit__team" {...rise(beat >= 3, i * 0.08)}>
              <b>{path.team}</b>
              <span>
                <Target aria-hidden="true" />
                {path.gap}
              </span>
            </motion.div>
            <ol className="cmp-fit__nodes">
              {path.courses.map((course, j) => (
                <motion.li key={course} className="cmp-fit__node" {...rise(beat >= 4, i * 0.12 + j * 0.16)}>
                  <span className="cmp-fit__dot" aria-hidden="true" />
                  {course}
                </motion.li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ───────────── 2 · التطبيق العملي ───────────── */
const ic = (Icon: LucideIcon) => <Icon aria-hidden="true" />
const coachCalls: ToolCallItem[] = [
  { id: 'read', tool: 'read_reply', icon: ic(MessageSquareText), tone: 'sky', running: 'يحلل الرد', done: 'حلل الرد', detail: 'اعتراض السعر', duration: 700 },
  { id: 'score', tool: 'score', icon: ic(Gauge), tone: 'lilac', running: 'يقيس أسلوب الإقناع', done: 'قاس أسلوب الإقناع', result: 'سؤال قيمة', duration: 800 },
  { id: 'tip', tool: 'suggest', icon: ic(Sparkles), tone: 'coral', running: 'يقترح صياغة أقوى', done: 'اقترح صياغة أقوى', duration: 700 },
]
const REP_AT = 1300

export function PracticeScene() {
  const beat = useBeats([150, REP_AT - 200])
  const rep = useTyped(coachChat.rep, REP_AT, 40)
  const [coach, setCoach] = useState(false)
  useEffect(() => {
    if (!rep.done) return
    const id = window.setTimeout(() => setCoach(true), 350)
    return () => window.clearTimeout(id)
  }, [rep.done])

  return (
    <div className="cmp-scene cmp-chat">
      <div className="cmp-chat__head">
        <span className="cmp-chat__badge">
          <Bot aria-hidden="true" /> محاكاة مع كوتش AI
        </span>
        <span className="cmp-chat__persona">{coachChat.persona}</span>
      </div>

      <motion.div className="cmp-bubble cmp-bubble--them" {...rise(beat >= 1)}>
        <Person src={avatar(6)} name="عميل" />
        <p>{coachChat.customer}</p>
      </motion.div>

      <motion.div className="cmp-bubble cmp-bubble--me" {...rise(beat >= 2)}>
        <p>
          {rep.started ? (
            <TypewriterChars text={rep.text} caret={!rep.done} phase={rep.done ? 'done' : 'typing'} />
          ) : (
            <span className="cmp-bubble__placeholder">اكتب ردّك…</span>
          )}
        </p>
        <span className="cmp-bubble__me">أنت</span>
      </motion.div>

      <AgentRun active={coach} runKey="coach" calls={coachCalls} className="cmp-chat__agent">
        <div className="cmp-coach">
          <span className="cmp-coach__score" dir="ltr">
            <NumberFlow value={coachChat.score} suffix="/100" locales="en-US" />
          </span>
          <p>{coachChat.tip}</p>
        </div>
      </AgentRun>
    </div>
  )
}

/* ───────────── 3 · الأعداد ───────────── */
const statusLabel = { active: 'نشط', done: 'أنهى المسار', new: 'جديد' } as const

export function ScaleScene() {
  const beat = useBeats([200, 2300, 4600])
  const reduce = useReducedMotion()
  const total = [0, 14, 248, 1240][beat] ?? 1240
  const rows = [...employees, ...employees]

  return (
    <div className="cmp-scene cmp-scale">
      <div className="cmp-scale__head">
        <span className="cmp-scale__label">
          <UsersRound aria-hidden="true" /> المتعلمون في المنصة
        </span>
        <b dir="ltr">
          <NumberFlow value={total} locales="en-US" animated={!reduce} />
        </b>
      </div>
      <div className="cmp-scale__cols" aria-hidden="true">
        <span>الموظف</span>
        <span>التقدّم</span>
        <span>الحالة</span>
      </div>
      <div className="cmp-scale__window">
        <ul className={cn('cmp-scale__list', beat >= 2 && !reduce && 'is-scrolling')}>
          {rows.map((person, i) => (
            <motion.li
              className="cmp-row"
              key={`${person.name}-${i}`}
              initial={{ opacity: 0, y: 10 }}
              animate={beat >= 1 ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.32, ease: EASE, delay: Math.min(i, 6) * 0.08 }}
            >
              <span className="cmp-row__who">
                <Person src={person.avatar} name={person.name} size={30} />
                <span>
                  <b>{person.name}</b>
                  <small>{person.team}</small>
                </span>
              </span>
              <span className="cmp-row__bar">
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={beat >= 1 ? { scaleX: person.progress / 100 } : undefined}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.3 + Math.min(i, 6) * 0.08 }}
                />
              </span>
              <span className={`cmp-row__status cmp-row__status--${person.status}`}>{statusLabel[person.status]}</span>
            </motion.li>
          ))}
        </ul>
      </div>
      <p className="cmp-note">
        <Sparkles aria-hidden="true" />
        نفس التجربة لـ 10 موظفين أو 10,000 موظف
      </p>
    </div>
  )
}

/* ───────────── 4 · المراجعة ───────────── */
const REWINDS = [2100, 4350]
const clips = [
  { title: 'الرد على «خلني أفكر فيها»', time: '02:14' },
  { title: 'سؤال التكلفة الحقيقية', time: '05:40' },
  { title: 'الإغلاق بخطوة تالية', time: '08:05' },
]

export function ReplayScene() {
  const beat = useBeats(REWINDS)
  const reduce = useReducedMotion()
  return (
    <div className="cmp-scene cmp-replay">
      <div className="cmp-replay__player">
        <div className="cmp-replay__thumb" aria-hidden="true">
          <motion.span
            className="cmp-replay__btn"
            key={beat}
            initial={beat > 0 && !reduce ? { scale: 0.7, rotate: 40 } : false}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            {beat > 0 ? <RotateCcw /> : <Play />}
          </motion.span>
        </div>
        <div className="cmp-replay__meta">
          <b>معالجة اعتراض السعر · الدرس 3</b>
          <span>مدرب معتمد · 9 دقائق</span>
          <div className="cmp-replay__track" aria-hidden="true">
            <motion.span
              className="cmp-replay__fill"
              initial={{ width: reduce ? '92%' : '0%' }}
              animate={reduce ? undefined : { width: ['0%', '62%', '30%', '80%', '44%', '92%'] }}
              transition={{ duration: 7, times: [0, 0.3, 0.33, 0.62, 0.65, 1], ease: 'linear' }}
            />
            {[30, 44].map((at) => (
              <i key={at} style={{ insetInlineStart: `${at}%` }} />
            ))}
          </div>
        </div>
        <span className="cmp-replay__count">
          <RotateCcw aria-hidden="true" />
          إعادة ×<NumberFlow value={beat} locales="en-US" animated={!reduce} />
        </span>
      </div>
      <ul className="cmp-replay__clips">
        {clips.map((clip, i) => (
          <motion.li key={clip.title} {...rise(true, 0.2 + i * 0.1)} className={cn(i === Math.min(beat, 1) && 'is-on')}>
            <Play aria-hidden="true" />
            <span>{clip.title}</span>
            <time dir="ltr">{clip.time}</time>
          </motion.li>
        ))}
      </ul>
      <p className="cmp-note">
        <Clock aria-hidden="true" />
        أي درس، أي مقطع، في أي وقت قبل مقابلة العميل
      </p>
    </div>
  )
}

/* ───────────── 5 · القياس ───────────── */
type DashView = 'overview' | 'users'

export function MeasureScene({ onHold }: { onHold?: () => void }) {
  const box = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLSpanElement>(null)
  const cancelled = useRef(false)
  const [view, setView] = useState<DashView>('overview')
  const [clicking, setClicking] = useState(false)
  const [manual, setManual] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const root = box.current
    const pointer = cursor.current
    if (reduce || !root || !pointer) return
    cancelled.current = false
    const timers = new Set<number>()
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const id = window.setTimeout(() => {
          timers.delete(id)
          resolve()
        }, ms)
        timers.add(id)
      })
    const q = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T & HTMLElement>(selector)
    const qa = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector))
    const point = (el: Element, fx = 0.5, fy = 0.5) => {
      const a = root.getBoundingClientRect()
      const b = el.getBoundingClientRect()
      return { x: b.left - a.left + b.width * fx, y: b.top - a.top + b.height * fy }
    }
    const moveTo = async (el: Element | null, fx = 0.5, fy = 0.5, duration = 0.75) => {
      if (!el) return
      const p = point(el, fx, fy)
      await animate(pointer, { x: p.x, y: p.y }, { duration, ease: EASE })
    }
    const click = async (el: HTMLElement | null) => {
      if (!el || cancelled.current) return
      setClicking(true)
      await sleep(130)
      if (!cancelled.current) el.click()
      await sleep(220)
      setClicking(false)
    }
    const hover = (el: Element, fx: number) => {
      const r = el.getBoundingClientRect()
      el.dispatchEvent(
        new PointerEvent('pointermove', {
          bubbles: true,
          pointerType: 'mouse',
          clientX: r.left + r.width * fx,
          clientY: r.top + r.height * 0.5,
        }),
      )
    }

    const run = async () => {
      const start = point(root, 0.55, 0.85)
      animate(pointer, { x: start.x, y: start.y, opacity: 1 }, { duration: 0 })
      await sleep(600)
      // 1. A shorter period: the number rolls, the line morphs.
      const periods = qa('[data-cmp-metric] div[dir="ltr"] > button')
      await moveTo(periods[0])
      await click(periods[0])
      await sleep(1100)
      if (cancelled.current) return
      // 2. One team only: the breakdown follows.
      const segments = qa('[data-cmp-metric] ul button')
      await moveTo(segments[1], 0.3)
      await click(segments[1])
      await sleep(1000)
      if (cancelled.current) return
      // 3. Scrub the days.
      const chart = q('[data-cmp-metric] [role="slider"]')
      if (chart) {
        await moveTo(chart, 0.25)
        for (let f = 0.25; f <= 0.9 && !cancelled.current; f += 0.05) {
          const p = point(chart, f)
          animate(pointer, { x: p.x, y: p.y }, { duration: 0.09, ease: 'linear' })
          hover(chart, f)
          await sleep(90)
        }
        await sleep(700)
        chart.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: root }))
      }
      if (cancelled.current) return
      // 4. Over to the people behind the numbers.
      const users = q('[data-cmp-nav="users"]')
      await moveTo(users)
      await click(users)
      await sleep(1900)
      if (cancelled.current) return
      // 5. Back, and leave the card as it was.
      const overview = q('[data-cmp-nav="overview"]')
      await moveTo(overview)
      await click(overview)
      await sleep(500)
      const segmentsAgain = qa('[data-cmp-metric] ul button')
      await moveTo(segmentsAgain[1], 0.3)
      await click(segmentsAgain[1])
      const periodsAgain = qa('[data-cmp-metric] div[dir="ltr"] > button')
      await moveTo(periodsAgain[1])
      await click(periodsAgain[1])
      await moveTo(root, 0.6, 0.92, 0.9)
    }
    void run()
    return () => {
      cancelled.current = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [reduce])

  // A real click takes over: the scripted cursor leaves and the step waits.
  const takeOver = (event: React.PointerEvent) => {
    if (!event.isTrusted || manual) return
    cancelled.current = true
    setManual(true)
    setClicking(false)
    onHold?.()
  }

  const nav: { id: DashView; label: string; Icon: LucideIcon }[] = [
    { id: 'overview', label: 'نظرة عامة', Icon: LayoutDashboard },
    { id: 'users', label: 'المستخدمون', Icon: UsersRound },
  ]

  return (
    <div className="cmp-scene cmp-dash" ref={box} onPointerDownCapture={takeOver}>
      <nav className="cmp-dash__nav" aria-label="لوحة المؤشرات">
        <span className="cmp-dash__brand">
          <BarChart3 aria-hidden="true" /> لوحة ماستري
        </span>
        {nav.map(({ id, label, Icon }) => (
          <button
            type="button"
            key={id}
            data-cmp-nav={id}
            className={cn('cmp-dash__nav-item', view === id && 'is-active')}
            onClick={() => setView(id)}
          >
            <Icon aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>
      <div className="cmp-dash__main">
        {view === 'overview' ? (
          <div data-cmp-metric>
            <MetricCard
              className="cmp-metric"
              label="ساعات التدريب"
              segments={hoursSegments}
              data={hoursData}
              events={hoursEvents}
              format="number"
            />
          </div>
        ) : (
          <ul className="cmp-dash__users">
            {employees.slice(0, 5).map((person, i) => (
              <motion.li key={person.name} {...rise(true, i * 0.06)}>
                <Person src={person.avatar} name={person.name} size={30} />
                <span className="cmp-dash__user">
                  <b>{person.name}</b>
                  <small>{person.team}</small>
                </span>
                <span className="cmp-row__bar cmp-dash__bar">
                  <motion.span
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: person.progress / 100 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.15 + i * 0.06 }}
                  />
                </span>
                <b dir="ltr" className="cmp-dash__pct">
                  {person.progress}%
                </b>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      {!reduce && !manual ? (
        <span className={cn('cmp-cursor', clicking && 'is-click')} ref={cursor} aria-hidden="true">
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M4 2.5 19.5 11l-6.6 1.7L9.6 19.4z" />
          </svg>
        </span>
      ) : null}
    </div>
  )
}

/* ───────────── 6 · المتابعة ───────────── */
export function FollowScene() {
  return (
    <div className="cmp-scene cmp-follow">
      <ProgressTracker
        className="cmp-follow__card"
        person={{ name: 'هيا المطيري', sub: 'مستشارة التدريب · مديرة حسابكم', avatar: avatar(12) }}
        value={{ from: 0, to: 12, unit: 'جلسة متابعة', caption: 'على مدار السنة، لا بانتهاء الدورة' }}
        steps={followSteps}
        reference="MS-2026-0412"
        footNote="رقم خطة التدريب"
        labels={{ running: 'جارية', done: 'طوال السنة' }}
        stepMs={1050}
      />
    </div>
  )
}

/* ───────────── 7 · التكلفة ───────────── */
export function CostScene() {
  const beat = useBeats([200, 2300])
  const reduce = useReducedMotion()
  const after = beat >= 2
  return (
    <div className="cmp-scene cmp-cost">
      <p className="cmp-cost__title">ما الذي تغطيه نفس الميزانية؟</p>
      <div className="cmp-cost__bar" aria-hidden="true">
        {costItems.map((item, i) => (
          <motion.span
            key={item}
            className="cmp-cost__part"
            initial={{ flexGrow: 0, opacity: 0 }}
            animate={{ flexGrow: after ? 0.0001 : beat >= 1 ? [3, 2, 2.4, 2.6][i] : 0, opacity: after ? 0 : beat >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: after ? 0 : i * 0.08 }}
          >
            {item}
          </motion.span>
        ))}
        <motion.span
          className="cmp-cost__one"
          initial={{ flexGrow: 0.0001, opacity: 0 }}
          animate={{ flexGrow: after ? 10 : 0.0001, opacity: after ? 1 : 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: after ? 0.15 : 0 }}
        >
          اشتراك سنوي يغطي الفريق كله
        </motion.span>
      </div>
      <p className="cmp-cost__caption">{after ? 'مع ماستري: بند واحد بدل أربعة' : 'التدريب التقليدي: تُدفع لكل دورة على حدة'}</p>
      <div className="cmp-cost__tiles">
        {costCover.map((tile) => (
          <div className={cn('cmp-cost__tile', after && 'is-after')} key={tile.label}>
            <b dir="ltr">
              <NumberFlow value={after ? tile.to : tile.from} suffix={after ? tile.suffix : ''} locales="en-US" animated={!reduce} />
            </b>
            <span>{tile.label}</span>
          </div>
        ))}
      </div>
      <p className="cmp-note cmp-note--muted">مثال توضيحي لفريق من 240 موظفاً</p>
    </div>
  )
}
