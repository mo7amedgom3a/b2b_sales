import { CalendarClock, Check } from 'lucide-react'
import { useState } from 'react'
import { Icon } from '../ui/Icon'
import type { FormEvent, ReactNode } from 'react'
import { booking, site } from '../content/ar'
import { isValidEmail, isValidFullName, isValidPhone, toLatinDigits } from '../lib/digits'
import { submitBooking } from '../lib/submitBooking'
import type { BookingPayload } from '../lib/submitBooking'
import { cn } from '../lib/cx'
import { GlassText } from '../motion/GlassText'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { Todo } from '../ui/Todo'

type FormState = {
  fullName: string
  jobTitle: string
  company: string
  phone: string
  email: string
  teamSize: string
  sector: string
  challenge: string
}

type Field = keyof FormState
type Status = 'idle' | 'loading' | 'success'

const initialForm: FormState = {
  fullName: '',
  jobTitle: '',
  company: '',
  phone: '',
  email: '',
  teamSize: '',
  sector: '',
  challenge: '',
}

function validate(form: FormState): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {}

  if (!form.fullName.trim()) errors.fullName = 'اكتب الاسم الكامل.'
  else if (!isValidFullName(form.fullName)) errors.fullName = 'اكتب الاسم الأول واسم العائلة على الأقل.'

  if (!form.jobTitle.trim()) errors.jobTitle = 'اكتب مسمى وظيفيك.'
  if (!form.company.trim()) errors.company = 'اكتب اسم الشركة.'

  if (!form.phone.trim()) errors.phone = 'أدخل رقم الجوال (واتساب).'
  else if (!isValidPhone(form.phone)) errors.phone = 'أدخل رقماً صحيحاً، مثل ‎+966 50 051 4343.'

  if (!form.email.trim()) errors.email = 'أدخل البريد الإلكتروني للعمل.'
  else if (!isValidEmail(form.email)) errors.email = 'أدخل بريداً صحيحاً، مثل sara@company.com.'

  return errors
}

export function Booking() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [status, setStatus] = useState<Status>('idle')

  const update = (field: Field, value: string) => {
    const next = field === 'phone' ? toLatinDigits(value) : value
    setForm((current) => ({ ...current, [field]: next }))
    if (errors[field]) {
      setErrors((current) => {
        const copy = { ...current }
        delete copy[field]
        return copy
      })
    }
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      const first = Object.keys(nextErrors)[0]
      if (first) document.getElementById(first)?.focus()
      return
    }

    setStatus('loading')
    const payload: BookingPayload = {
      ...form,
      challenge: form.challenge.trim() || undefined,
    }

    try {
      await submitBooking(payload)
      setStatus('success')
    } catch {
      setStatus('idle')
      setErrors({ email: 'تعذّر إرسال الطلب. جرّب مرة أخرى أو راسلنا على واتساب.' })
    }
  }

  const reset = () => {
    setForm(initialForm)
    setErrors({})
    setStatus('idle')
  }

  return (
    <section className="section booking" id="booking">
      <div className="ma-container booking__grid">
        <Reveal className="booking__copy">
          <span className="eyebrow">
            <span className="eyebrow__dot" aria-hidden="true" />
            {booking.eyebrow}
          </span>
          <h2 className="booking__title"><GlassText>{booking.title}</GlassText></h2>
          <p className="booking__lead">{booking.lead}</p>
          <ol className="booking__outcomes">
            {booking.outcomes.map((outcome, index) => (
              <li className="booking__outcome" key={outcome}>
                <span className="booking__outcome__num">{index + 1}</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ol>
          <p className="booking__note">
            {booking.note} <Todo>24 ساعة عمل تحتاج تأكيداً</Todo>
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="form-card">
            {status === 'success' ? (
              <div className="form-success" role="status">
                <div className="ma-alert ma-alert--success">
                  <Check aria-hidden="true" />
                  <div>
                    <p className="ma-alert__title">تم استلام طلبك</p>
                    <p className="ma-alert__text">{booking.success}</p>
                  </div>
                </div>
                <Button href={site.whatsappHref} target="_blank" rel="noopener noreferrer" variant="soft" block>
                  تحدث الآن على واتساب
                </Button>
                <button className="ma-btn ma-btn--ghost ma-btn--block" type="button" onClick={reset}>
                  حجز موعد آخر
                </button>
              </div>
            ) : (
              <>
                <div className="form-card__head">
                  <h3>{booking.formTitle}</h3>
                  <p><CalendarClock className="icon-clock" aria-hidden="true" /> {booking.formSub}</p>
                </div>

                <form className="form-grid" onSubmit={submit} noValidate>
                  <FieldWrap
                    field="fullName"
                    label={booking.fields.fullName}
                    error={errors.fullName}
                    required
                  >
                    <input
                      className="ma-input"
                      id="fullName"
                      name="fullName"
                      autoComplete="name"
                      value={form.fullName}
                      onChange={(event) => update('fullName', event.target.value)}
                      aria-invalid={Boolean(errors.fullName)}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    />
                  </FieldWrap>

                  <FieldWrap field="jobTitle" label={booking.fields.jobTitle} error={errors.jobTitle} required>
                    <input
                      className="ma-input"
                      id="jobTitle"
                      name="jobTitle"
                      autoComplete="organization-title"
                      value={form.jobTitle}
                      onChange={(event) => update('jobTitle', event.target.value)}
                      aria-invalid={Boolean(errors.jobTitle)}
                      aria-describedby={errors.jobTitle ? 'jobTitle-error' : undefined}
                    />
                  </FieldWrap>

                  <FieldWrap field="company" label={booking.fields.company} error={errors.company} required>
                    <input
                      className="ma-input"
                      id="company"
                      name="company"
                      autoComplete="organization"
                      value={form.company}
                      onChange={(event) => update('company', event.target.value)}
                      aria-invalid={Boolean(errors.company)}
                      aria-describedby={errors.company ? 'company-error' : undefined}
                    />
                  </FieldWrap>

                  <FieldWrap
                    field="phone"
                    label={booking.fields.phone}
                    error={errors.phone}
                    help="أدخل الرقم مع رمز الدولة إن أمكن."
                    required
                  >
                    <input
                      className="ma-input"
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      dir="ltr"
                      autoComplete="tel"
                      placeholder="+966 50 051 4343"
                      value={form.phone}
                      onChange={(event) => update('phone', event.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'phone-error' : 'phone-help'}
                    />
                  </FieldWrap>

                  <div className="span-2">
                    <FieldWrap field="email" label={booking.fields.email} error={errors.email} required>
                      <input
                        className="ma-input"
                        id="email"
                        name="email"
                        type="email"
                        dir="ltr"
                        autoComplete="email"
                        placeholder="sara@company.com"
                        value={form.email}
                        onChange={(event) => update('email', event.target.value)}
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                    </FieldWrap>
                  </div>

                  <FieldWrap field="teamSize" label={booking.fields.teamSize} error={errors.teamSize}>
                    <select
                      className="ma-select"
                      id="teamSize"
                      name="teamSize"
                      value={form.teamSize}
                      onChange={(event) => update('teamSize', event.target.value)}
                    >
                      <option value="">اختر</option>
                      {booking.teamSizes.map((size) => (
                        <option value={size} key={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </FieldWrap>

                  <FieldWrap field="sector" label={booking.fields.sector} error={errors.sector}>
                    <select
                      className="ma-select"
                      id="sector"
                      name="sector"
                      value={form.sector}
                      onChange={(event) => update('sector', event.target.value)}
                    >
                      <option value="">اختر</option>
                      {booking.sectors.map((sector) => (
                        <option value={sector} key={sector}>
                          {sector}
                        </option>
                      ))}
                    </select>
                  </FieldWrap>

                  <div className="span-2">
                    <FieldWrap field="challenge" label={booking.fields.challenge} error={errors.challenge}>
                      <textarea
                        className="ma-input"
                        id="challenge"
                        name="challenge"
                        rows={3}
                        placeholder={booking.challengePlaceholder}
                        value={form.challenge}
                        onChange={(event) => update('challenge', event.target.value)}
                      />
                    </FieldWrap>
                  </div>

                  <div className="span-2">
                    <button
                      className={cn('ma-btn ma-btn--primary ma-btn--block form-submit', status === 'loading' && 'is-loading')}
                      type="submit"
                      disabled={status === 'loading'}
                      aria-busy={status === 'loading'}
                    >
                      {booking.submit}
                      {status !== 'loading' ? <Icon name="arrow" className="btn-arrow" size={18} /> : null}
                    </button>
                    <p className="form-note">{booking.note}</p>
                  </div>
                </form>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

type FieldWrapProps = {
  field: Field
  label: string
  error?: string
  help?: string
  required?: boolean
  children: ReactNode
}

function FieldWrap({ field, label, error, help, required, children }: FieldWrapProps) {
  return (
    <div className={cn('ma-field', error && 'is-error')}>
      <label className="ma-label" htmlFor={field}>
        {label}
        {required ? <span className="req" aria-hidden="true"> *</span> : null}
      </label>
      {children}
      {error ? (
        <span className="ma-help" id={`${field}-error`} role="alert">
          {error}
        </span>
      ) : help ? (
        <span className="ma-help" id={`${field}-help`}>
          {help}
        </span>
      ) : null}
    </div>
  )
}
