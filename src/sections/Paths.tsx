import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { paths } from '../content/ar'
import { useInViewAutoplay } from '../motion/useInViewAutoplay'
import { TypewriterChars } from '../motion/TypewriterText'
import { useExitGhosts, useTypewriter } from '../motion/useTypewriter'
import { Reveal } from '../motion/Reveal'
import { Button } from '../ui/Button'
import { SecHead } from '../ui/SecHead'
import { Todo } from '../ui/Todo'

type Selection = Record<string, number>

const initialSelection: Selection = {
  competency: 0,
  gap: 2,
  sector: 1,
  level: 0,
}

export function Paths() {
  const reduce = useReducedMotion()
  const { ref, paused, hoverProps } = useInViewAutoplay<HTMLDivElement>({ threshold: 0.25 })
  const [selection, setSelection] = useState<Selection>(initialSelection)
  const [auto, setAuto] = useState(true)

  useEffect(() => {
    if (reduce || !auto || paused) return
    const timer = window.setInterval(() => {
      const dim = paths.dimensions[Math.floor(Math.random() * paths.dimensions.length)]
      if (!dim) return
      const index = Math.floor(Math.random() * dim.options.length)
      setSelection((current) => ({ ...current, [dim.key]: index }))
    }, 2600)
    return () => window.clearInterval(timer)
  }, [reduce, auto, paused])

  const get = (key: string) => {
    const dim = paths.dimensions.find((item) => item.key === key)
    if (!dim) return ''
    return dim.options[selection[key] ?? 0] ?? dim.options[0] ?? ''
  }

  const composed = `مسار ${get('level')} في ${get('sector')} — يعالج فجوة «${get('gap')}» ويبني جدارة «${get('competency')}».`
  const { text: typedPath } = useTypewriter([composed], {
    loop: false,
    restartKey: composed,
    holdMs: 6000,
    paused,
    jitterMs: [14, 30],
    punctuationHoldMs: 60,
  })
  const ghosts = useExitGhosts(typedPath)

  const progress = Math.max(
    6,
    Math.round((Array.from(typedPath).length / Math.max(1, Array.from(composed).length)) * 100),
  )

  return (
    <section className="section section--band paths" id="paths">
      <div className="ma-container">
        <SecHead index="05" title={paths.title} lead={paths.lead} />

        <div className="paths__grid">
          <div className="dim">
            {paths.dimensions.map((dim) => (
              <div className="dim__row" key={dim.key}>
                <div className="dim__label">
                  {dim.label}
                  {'hint' in dim && dim.hint ? <span className="dim__hint">{dim.hint}</span> : null}
                </div>
                <div className="chips">
                  {dim.options.map((option, index) => (
                    <button
                      className="chip"
                      type="button"
                      key={option}
                      aria-pressed={(selection[dim.key] ?? 0) === index}
                      onClick={() => {
                        setSelection((current) => ({ ...current, [dim.key]: index }))
                        setAuto(false)
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div ref={ref} {...hoverProps}>
            <Reveal delay={0.08}>
              <div className="builder card-raised card-tone-sky">
                <div className="builder__top">
                  <span className="builder__title">
                    <span className="dot" aria-hidden="true" />
                    {paths.builder.title}
                  </span>
                  <span className="ma-tag ma-tag--soft">أكثر من 1000 احتمال</span>
                </div>
                <div className="builder__body">
                  <div className="builder__path">
                    <TypewriterChars text={typedPath} ghosts={ghosts} caret phase="typing" />
                  </div>
                  <div className="builder__meta">
                    <span className="ma-tag ma-tag--yellow">{get('level')}</span>
                    <span className="ma-tag ma-tag--sky">{get('sector')}</span>
                    <span className="ma-tag ma-tag--coral">{get('gap')}</span>
                    <span className="ma-tag ma-tag--soft">{get('competency')}</span>
                  </div>
                  <div className="builder__bar">
                    <div className="track">
                      <div className="fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="builder__foot">
                    <span>{paths.builder.note}</span>
                    <span className="builder__count">4 أبعاد</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="paths__envs">
          <h3>بيئات البيع التي نغطيها</h3>
          <div className="chips">
            {paths.envs.map((env) => (
              <span className="env-chip" key={env}>
                {env}
              </span>
            ))}
          </div>
        </div>

        <Reveal>
          <p className="paths__example">
            <Sparkles size={14} aria-hidden="true" style={{ display: 'inline', marginInlineEnd: 6, color: 'var(--coral)' }} />
            {paths.example} <Todo>بقية القطاعات السبعة</Todo>
          </p>
          <div className="paths__cta">
            <Button href="#booking" variant="primary">
              {paths.cta}
              <ArrowRight className="btn-arrow" size={18} aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
