import { Check, TrendingUp } from 'lucide-react'
import { reports } from '../content/ar'
import { Reveal } from '../motion/Reveal'
import { Avatar } from '../ui/Avatar'
import { SecHead } from '../ui/SecHead'
import { Tag } from '../ui/Tag'

const kpis = [
  { label: 'نسب الإكمال', value: '82%' },
  { label: 'متوسط الاختبارات', value: '76%' },
  { label: 'ساعات التدريب', value: '18.5' },
  { label: 'فجوات تحتاج متابعة', value: '3' },
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

export function Reports() {
  return (
    <section className="section section--band reports" id="reports">
      <div className="ma-container">
        <SecHead index="08" title={reports.title} lead={reports.lead} />

        <div className="reports__grid">
          <Reveal>
            <div className="reports__list">
              {reports.bullets.map(([title, body]) => (
                <div className="report-item" key={title}>
                  <Check aria-hidden="true" />
                  <p>
                    <b>{title}:</b> {body}
                  </p>
                </div>
              ))}
            </div>
            <p className="reports__note">{reports.note}</p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="dash">
              <div className="dash__top">
                <span className="dash__title">لوحة متابعة الفريق</span>
                <Tag tone="soft">{reports.demoLabel}</Tag>
              </div>
              <div className="dash__body">
                <div className="dash__kpis">
                  {kpis.map((kpi) => (
                    <div className="dash__kpi" key={kpi.label}>
                      <b dir="ltr">{kpi.value}</b>
                      <span>{kpi.label}</span>
                    </div>
                  ))}
                </div>

                <div className="dash__bars">
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

                <table className="dash__table">
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
