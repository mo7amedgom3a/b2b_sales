import type { MetricPoint } from '@/components/kokonutui/metric-card'

/** Self-hosted Unsplash portraits (see public/assets/avatars/CREDITS.md). */
export const avatar = (n: number) => `/assets/avatars/a${String(n).padStart(2, '0')}.webp`

export type Employee = { name: string; team: string; avatar: string; progress: number; status: 'active' | 'done' | 'new' }

const people: [string, number][] = [
  ['عبدالله القحطاني', 1],
  ['نورة السبيعي', 9],
  ['محمد العتيبي', 2],
  ['سارة العنزي', 10],
  ['خالد الشمري', 3],
  ['ريم الحربي', 11],
  ['فهد الدوسري', 4],
  ['هيا المطيري', 12],
  ['سلطان الحربي', 5],
  ['لمى الشهري', 13],
  ['عمر الزهراني', 6],
  ['دانة العمري', 14],
  ['يوسف المالكي', 7],
  ['ماجد الغامدي', 8],
]
const teams = ['المبيعات', 'خدمة العملاء', 'المشرفون', 'المبيعات الميدانية']
const statuses: Employee['status'][] = ['active', 'done', 'active', 'new']

export const employees: Employee[] = people.map(([name, n], i) => ({
  name,
  avatar: avatar(n),
  team: teams[i % teams.length],
  progress: [72, 100, 48, 12, 86, 64, 100, 35, 58, 91, 22, 77, 100, 41][i],
  status: statuses[(i * 3) % statuses.length],
}))

/** المواءمة: one diagnosis, a different path per team. */
export const teamPaths = [
  { team: 'المبيعات', gap: 'الاعتراضات', courses: ['أسئلة الاكتشاف', 'معالجة اعتراض السعر', 'الإغلاق دون خصم'] },
  { team: 'خدمة العملاء', gap: 'الحل من أول اتصال', courses: ['الاحتواء والتعاطف', 'حل المشكلة من أول اتصال', 'تحويل الشكوى لفرصة'] },
  { team: 'المشرفون', gap: 'الكوتشينغ', courses: ['الكوتشينغ اليومي', 'قراءة مؤشرات الفريق', 'إدارة الأداء'] },
] as const

/** التطبيق العملي: a short role-play with the AI coach. */
export const coachChat = {
  persona: 'مدير مشتريات · قطاع التجزئة',
  customer: 'سعركم أعلى من المنافس بـ 15٪… لماذا أدفع أكثر؟',
  rep: 'سؤال في محله. قبل السعر: كم يكلّفكم اليوم تأخّر التوريد عن الفروع؟',
  score: 86,
  tip: 'أحسنت: نقلت الحديث من السعر إلى القيمة. أضف رقماً من حالة مشابهة لتقوية الرد.',
}

/** المتابعة: the account manager's year with the team. */
export const followSteps = [
  { title: 'تشخيص الفريق', detail: 'يناير · 48 موظفاً' },
  { title: 'إطلاق المسار', detail: 'فبراير · 3 مسارات' },
  { title: 'مراجعة ربعية', detail: 'أبريل · تعديل الأولويات' },
  { title: 'تقرير منتصف السنة', detail: 'يوليو · للإدارة' },
  { title: 'خطة السنة القادمة', detail: 'ديسمبر' },
]

/** القياس: daily training hours per team, seeded so every visit draws the same chart. */
function trainingHours(days: number, end: string): MetricPoint[] {
  let seed = 7
  const random = () => {
    seed = (seed * 16_807) % 2_147_483_647
    return seed / 2_147_483_647
  }
  const last = Date.parse(`${end}T00:00:00Z`)
  const out: MetricPoint[] = []
  let sales = 38
  let service = 26
  let leads = 9
  for (let i = 0; i < days; i++) {
    const t = last - (days - 1 - i) * 86_400_000
    const weekday = new Date(t).getUTCDay()
    // Friday/Saturday weekend
    const off = weekday === 5 || weekday === 6
    sales += 0.12 + (random() - 0.5) * 2.4
    service += 0.1 + (random() - 0.5) * 2
    leads += 0.03 + (random() - 0.5) * 0.8
    // A new path launches 40 days before the end.
    const boost = i > days - 40 ? 1.18 : 1
    out.push({
      date: new Date(t).toISOString().slice(0, 10),
      parts: [
        Math.max(4, Math.round(sales * boost * (off ? 0.35 : 1))),
        Math.max(3, Math.round(service * boost * (off ? 0.45 : 1))),
        Math.max(1, Math.round(leads * (off ? 0.3 : 1))),
      ],
    })
  }
  return out
}

export const hoursData = trainingHours(180, '2026-11-20')
export const hoursEvents = [{ date: hoursData[180 - 40].date, label: 'إطلاق مسار الاعتراضات' }]
export const hoursSegments = ['المبيعات', 'خدمة العملاء', 'المشرفون']

/** التكلفة: what one budget covers, traditional vs Mastery (illustrative). */
export const costItems = ['المدرب', 'القاعة', 'التنقل والإقامة', 'ساعات العمل الضائعة']
export const costCover = [
  { label: 'الموظفون', from: 20, to: 240, suffix: '' },
  { label: 'أيام التعلم', from: 2, to: 365, suffix: '' },
  { label: 'الدورات', from: 1, to: 1000, suffix: '+' },
]
