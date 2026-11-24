import { ArrowLeft, Bot, Gauge, GraduationCap, Layers, Route, Stethoscope } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { offer } from '../../content/ar'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { loadGsap } from '../../motion/gsap'
import { SecHead } from '../../ui/SecHead'

/** Same icon per step as the demo's step columns. */
const pillarIcons = {
  gaps: Stethoscope,
  path: Route,
  training: GraduationCap,
  sim: Bot,
  dash: Gauge,
} as const

type Point = { x: number; y: number }
type Curve = { d: string; width: number; height: number; vertical: boolean; stops: number[] }

/**
 * Smooth curve through the node centres. Horizontal layouts bend like an S
 * between a high and a low node; the vertical (phone) layout snakes between
 * nodes that alternate sides.
 */
function buildCurve(points: Point[], vertical: boolean): string {
  if (points.length === 0) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1]
    const b = points[i]
    if (vertical) {
      const dy = (b.y - a.y) * 0.55
      d += ` C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`
    } else {
      const dx = (b.x - a.x) * 0.55
      d += ` C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`
    }
  }
  return d
}

/**
 * «ما الذي تقدّمه ماستري» — five services on a living curve.
 * The connector is measured from the real node positions (so it always passes
 * through them), drawn by scroll, coloured by a flowing gradient, and a light
 * particle travels along it. Each node carries the value it delivers.
 */
export function Offer() {
  const stageRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const reduce = usePrefersReducedMotion()
  const gradientId = `offer-flow-${useId().replace(/:/g, '')}`
  const glowId = `${gradientId}-glow`
  const [curve, setCurve] = useState<Curve | null>(null)

  // Measure node centres → curve. Re-measures on resize and font load.
  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const measure = () => {
      const box = stage.getBoundingClientRect()
      const nodes = Array.from(stage.querySelectorAll<HTMLElement>('.offer-node__orb'))
      if (nodes.length === 0 || box.width === 0) return
      const points = nodes.map((node) => {
        const r = node.getBoundingClientRect()
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top }
      })
      const vertical = window.matchMedia('(max-width: 1023px)').matches
      // Where each node sits along the line (0…1), for lighting them as it draws.
      const span = vertical ? points[points.length - 1].y - points[0].y : points[0].x - points[points.length - 1].x
      const stops = points.map((point) =>
        span === 0 ? 0 : vertical ? (point.y - points[0].y) / span : (points[0].x - point.x) / span,
      )
      setCurve({ d: buildCurve(points, vertical), width: box.width, height: box.height, vertical, stops })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    void document.fonts?.ready.then(measure)
    return () => observer.disconnect()
  }, [])

  // Scroll draws the line; nodes light up as it reaches them.
  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !pathRef.current || !curve) return
    const nodes = Array.from(stage.querySelectorAll<HTMLElement>('.offer-node'))
    if (reduce) {
      nodes.forEach((node) => node.classList.add('is-lit'))
      return
    }
    let cancelled = false
    let cleanup = () => {}

    void loadGsap()
      .then(({ gsap }) => {
        if (cancelled) return
        stage.classList.add('is-drawn')
        const state = { p: 0 }
        const tween = gsap.fromTo(
          state,
          { p: 0 },
          {
            p: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: curve.vertical ? 'top 72%' : 'top 70%',
              end: curve.vertical ? 'bottom 60%' : 'center 45%',
              scrub: 0.8,
            },
            onUpdate: () => {
              stage.style.setProperty('--offer-p', state.p.toFixed(4))
              nodes.forEach((node, index) =>
                node.classList.toggle('is-lit', state.p >= (curve.stops[index] ?? 0) - 0.015),
              )
            },
          },
        )
        cleanup = () => {
          tween.scrollTrigger?.kill()
          tween.kill()
          stage.classList.remove('is-drawn')
          stage.style.removeProperty('--offer-p')
          nodes.forEach((node) => node.classList.remove('is-lit'))
        }
      })
      .catch(() => {
        nodes.forEach((node) => node.classList.add('is-lit'))
      })

    return () => {
      cancelled = true
      cleanup()
    }
  }, [curve, reduce])

  // Gradient flows along the line (right → left in RTL, downward on phones).
  const flow = curve ? (curve.vertical ? curve.height : curve.width) : 1000

  return (
    <section className="section offer" id="offer">
      <div className="offer__aurora" aria-hidden="true" />
      <div className="ma-container">
        <SecHead index="03" title={offer.title} lead={offer.lead} icon={Layers} />

        <div className="offer__stage" ref={stageRef}>
          {curve ? (
            <svg
              className="offer__curve"
              width={curve.width}
              height={curve.height}
              viewBox={`0 0 ${curve.width} ${curve.height}`}
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id={gradientId}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="0"
                  x2={curve.vertical ? 0 : flow}
                  y2={curve.vertical ? flow : 0}
                  spreadMethod="repeat"
                >
                  <stop offset="0" stopColor="var(--coral)" />
                  <stop offset=".25" stopColor="var(--yellow)" />
                  <stop offset=".5" stopColor="var(--lilac)" />
                  <stop offset=".75" stopColor="var(--sky)" />
                  <stop offset="1" stopColor="var(--coral)" />
                  {reduce ? null : (
                    <animateTransform
                      attributeName="gradientTransform"
                      type="translate"
                      from="0 0"
                      to={curve.vertical ? `0 ${flow}` : `${-flow} 0`}
                      dur="5s"
                      repeatCount="indefinite"
                    />
                  )}
                </linearGradient>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="6" />
                </filter>
              </defs>
              {/* Faint rail the line draws over */}
              <path className="offer__rail" d={curve.d} />
              {/* Soft glow under the live line */}
              <path className="offer__line-glow" d={curve.d} stroke={`url(#${gradientId})`} filter={`url(#${glowId})`} pathLength={1} />
              <path ref={pathRef} className="offer__line" d={curve.d} stroke={`url(#${gradientId})`} pathLength={1} />
              {reduce ? null : (
                <g className="offer__comet" key={curve.d}>
                  <circle r="9" className="offer__comet-halo" />
                  <circle r="4" className="offer__comet-core" />
                  <animateMotion dur="6.5s" repeatCount="indefinite" path={curve.d} calcMode="spline" keyTimes="0;1" keySplines="0.45 0 0.55 1" />
                </g>
              )}
            </svg>
          ) : null}

          <ol className="offer__nodes">
            {offer.pillars.map((pillar, index) => {
              const Icon = pillarIcons[pillar.key]
              return (
                <li className={index % 2 === 0 ? 'offer-node offer-node--high' : 'offer-node offer-node--low'} key={pillar.key}>
                  <span className="offer-node__orb" aria-hidden="true">
                    <span className="offer-node__ring" />
                    <Icon />
                    <span className="offer-node__num">{index + 1}</span>
                  </span>
                  <div className="offer-node__card">
                    <h3 className="offer-node__title">{pillar.title}</h3>
                    <p className="offer-node__metric">
                      {/* Numbers like «+1000» or «24/7» stay left-to-right so the sign keeps its place. */}
                      <b dir={/\p{Script=Arabic}/u.test(pillar.metric) ? undefined : 'ltr'}>{pillar.metric}</b>
                      <span>{pillar.metricLabel}</span>
                    </p>
                    <p className="offer-node__text">{pillar.body}</p>
                    <a className="offer-node__link" href={pillar.href}>
                      {pillar.link}
                      <ArrowLeft aria-hidden="true" />
                    </a>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
