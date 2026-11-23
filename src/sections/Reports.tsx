import {
  Blocks,
  Check,
  FileText,
  Radar as RadarIcon,
  Route,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { reports } from '../content/ar'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterText } from '../motion/TypewriterText'
import { Reveal } from '../motion/Reveal'
import { Avatar } from '../ui/Avatar'
import { ChartContainer, kitColor } from '../ui/chart'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const bulletIcons = [FileText, TrendingUp, Target, RadarIcon, Route, Sparkles, Blocks] as const

const kpis = [
  { label: 'نسب الإكمال', value: '82%', Icon: Check },
  { label: 'متوسط الاختبارات', value: '76%', Icon: Target },
  { label: 'ساعات التدريب', value: '18.5', Icon: Timer },
  { label: 'فجوات تحتاج متابعة', value: '3', Icon: TriangleAlert },
] as const

const skills = [
  { label: 'إدارة الاعتراضات', value: 64 },
  { label: 'الإغلاق', value: 58 },
  { label: 'التنقيب والتأهيل', value: 72 },
  { label: 'عرض القيمة', value: 61 },
] as const

const topPeople = [
  { name: 'أحمد العتيبي', initial: 'أ', hours: '18.5', completion: '92%', tone: 'yellow' },
  { name: 'سارة القحطاني', initial: 'س', hours: '16.2', completion: '84%', tone: 'sky' },
  { name: 'خالد الشمري', initial: 'خ', hours: '9.4', completion: '51%', tone: 'lilac' },
] as const

const radarConfig = { value: { label: 'المستوى', color: kitColor('coral') } } as const

type Employee = (typeof reports.employees)[number]

function EmployeeRadar({ employee, paused }: { employee: Employee; paused: boolean }) {
  const data = reports.skills.map((skill, index) => ({
    name: skill,
    value: employee.values[index] ?? 0,
  }))

  return (
    <ChartContainer config={radarConfig} height={158} aria-label={`ملف ${employee.name} المهاري`}>
      <RadarChart data={data} outerRadius="68%">
        <PolarGrid />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 9 }} />
        <Radar
          dataKey="value"
          stroke="var(--coral)"
          fill="var(--coral)"
          fillOpacity={0.26}
          isAnimationActive={!paused}
          animationDuration={850}
        />
      </RadarChart>
    </ChartContainer>
  )
}

function ReportSpotlight() {
  const reduce = useReducedMotion()
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.3 })
  const [active, setActive] = useState(0)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (reduce || !auto || paused) return
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % reports.bullets.length)
    }, 3600)
    return () => window.clearInterval(timer)
  }, [reduce, auto, paused])

  const [title, body] = reports.bullets[active] ?? reports.bullets[0]
  const Icon = bulletIcons[active] ?? FileText

  return (
    <div className="spot" ref={ref}>
      <div className="spot__chips" role="group" aria-label="مزايا لوحة المتابعة">
        {reports.bullets.map(([itemTitle], index) => {
          const ChipIcon = bulletIcons[index] ?? FileText
          return (
            <button
              className="spot__chip"
              type="button"
              key={itemTitle}
              aria-pressed={index === active}
              onClick={() => {
                setActive(index)
                setAuto(false)
              }}
            >
              <ChipIcon aria-hidden="true" />
              {itemTitle}
            </button>
          )
        })}
      </div>
      <div className="spot__body is-enter" key={active} aria-live="polite">
        <h4>
          <Icon aria-hidden="true" />
          {title}
        </h4>
        <p>{body}</p>
      </div>
    </div>
  )
}

export function Reports() {
  const reduce = useReducedMotion()
  const { ref, paused } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.25 })
  const [queryIndex, setQueryIndex] = useState(0)
  const [employeeIndex, setEmployeeIndex] = useState(0)
  const [autoEmployee, setAutoEmployee] = useState(true)

  useEffect(() => {
    if (reduce || paused) return
    const timer = window.setInterval(() => {
      setQueryIndex((value) => (value + 1) % reports.queries.length)
    }, 5200)
    return () => window.clearInterval(timer)
  }, [reduce, paused])

  useEffect(() => {
    if (reduce || !autoEmployee || paused) return
    const timer = window.setInterval(() => {
      setEmployeeIndex((value) => (value + 1) % reports.employees.length)
    }, 3000)
    return () => window.clearInterval(timer)
  }, [reduce, autoEmployee, paused])

  const employee = reports.employees[employeeIndex] ?? reports.employees[0]

  return (
    <section className="section section--band reports" id="reports">
      <div className="ma-container" ref={ref}>
        <SecHead index="08" title={reports.title} lead={reports.lead} />

        <div className="reports__grid">
          <Reveal>
            <div className="reports__list">
              {reports.bullets.map(([title, body], index) => {
                const Icon = bulletIcons[index] ?? FileText
                return (
                  <div className="report-item" key={title}>
                    <span className="report-item__icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <p>
                      <b>{title}:</b> {body}
                    </p>
                  </div>
                )
              })}
            </div>
            <p className="reports__note">{reports.note}</p>
            <ReportSpotlight />
          </Reveal>

          <Reveal delay={0.08}>
            <div className="dash card-glow glow-purple">
              <div className="dash__top">
                <span className="dash__title">لوحة متابعة الفريق</span>
                <Tag tone="soft">{reports.demoLabel}</Tag>
              </div>

              <div className="dash__query">
                <Sparkles aria-hidden="true" />
                <TypewriterText
                  key={queryIndex}
                  texts={[reports.queries[queryIndex] ?? reports.queries[0]]}
                  loop={false}
                  holdMs={10_000}
                  jitterMs={[36, 72]}
                  paused={paused}
                />
              </div>

              <div className="dash__body">
                <div className="dash__kpis">
                  {kpis.map((kpi) => (
                    <div className="dash__kpi" key={kpi.label}>
                      <kpi.Icon className="dash__kpi-icon" aria-hidden="true" />
                      <b dir="ltr">{kpi.value}</b>
                      <span>{kpi.label}</span>
                    </div>
                  ))}
                </div>

                <div className={queryIndex === 1 ? 'dash__bars is-focus' : 'dash__bars'}>
                  {skills.map((skill, index) => (
                    <div className="dash__bar-row" key={skill.label}>
                      <span>{skill.label}</span>
                      <span className="dash__track">
                        <span
                          className="dash__fill"
                          style={{ width: `${skill.value}%`, animationDelay: `${index * 90}ms` }}
                        />
                      </span>
                      <b>{skill.value}%</b>
                    </div>
                  ))}
                </div>

                <div className={queryIndex === 2 ? 'dash__radar is-focus' : 'dash__radar'}>
                  <div className="dash__radar-chart">
                    <div className="chart-panel__head">
                      <span className="chart-panel__title">
                        <RadarIcon size={12} aria-hidden="true" /> ملف {employee.name} المهاري
                      </span>
                    </div>
                    <EmployeeRadar employee={employee} paused={paused} />
                  </div>
                  <div className="dash__people" role="group" aria-label="اختر موظفاً">
                    {reports.employees.map((person, index) => (
                      <button
                        className="dash__person-chip"
                        type="button"
                        key={person.name}
                        aria-pressed={index === employeeIndex}
                        onClick={() => {
                          setEmployeeIndex(index)
                          setAutoEmployee(false)
                        }}
                      >
                        <Avatar initial={person.initial} tone={person.tone} size={18} />
                        {person.name}
                      </button>
                    ))}
                  </div>
                </div>

                <table className={queryIndex === 0 ? 'dash__table is-focus' : 'dash__table'}>
                  <thead>
                    <tr>
                      <th>المتدرب</th>
                      <th>ساعات</th>
                      <th>إكمال</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPeople.map((person) => (
                      <tr key={person.name}>
                        <td>
                          <span className="dash__person">
                            <Avatar initial={person.initial} tone={person.tone} size={22} />
                            {person.name}
                          </span>
                        </td>
                        <td dir="ltr">{person.hours}</td>
                        <td dir="ltr">{person.completion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="dash__note">
                  <TrendingUp size={11} aria-hidden="true" /> مثال توضيحي — البيانات لا تمثل عميلاً حقيقياً.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
