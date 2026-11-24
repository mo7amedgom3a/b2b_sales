import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode, SVGProps } from 'react'
import { motion, type Variants } from 'motion/react'
import { cn } from '../lib/cx'

/**
 * Animate UI–style animated Lucide icons, implemented locally with `motion`
 * (the same idea as animate-ui.com/docs/icons: the icon's paths animate when
 * its wrapper is hovered, focused or tapped).
 *
 * Usage:
 *   <AnimateIcon animateOnHover><AnimatedSun /></AnimateIcon>
 */
const AnimateContext = createContext(false)

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

export function AnimateIcon({
  children,
  className,
  animateOnHover = true,
  animateOnTap = true,
  loop,
  loopDelay = 0,
}: {
  children: ReactNode
  className?: string
  animateOnHover?: boolean
  animateOnTap?: boolean
  /** Replay the icon's animation every `loop` ms (like the charts), unless reduced motion is on. */
  loop?: number
  /** Offset before the first replay, so a row of icons doesn't pulse in lockstep. */
  loopDelay?: number
}) {
  const [animate, setAnimate] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!loop) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let interval: number | undefined
    const pulse = () => {
      setAnimate(false)
      window.requestAnimationFrame(() => setAnimate(true))
    }
    const start = window.setTimeout(() => {
      pulse()
      interval = window.setInterval(pulse, loop)
    }, loopDelay)
    return () => {
      window.clearTimeout(start)
      window.clearInterval(interval)
    }
  }, [loop, loopDelay])

  const replay = () => {
    window.clearTimeout(timer.current)
    setAnimate(false)
    window.requestAnimationFrame(() => setAnimate(true))
    timer.current = window.setTimeout(() => setAnimate(false), 560)
  }

  return (
    <AnimateContext.Provider value={animate}>
      <span
        className={cn('anim-icon', className)}
        onPointerEnter={animateOnHover ? () => setAnimate(true) : undefined}
        onPointerLeave={animateOnHover ? () => setAnimate(false) : undefined}
        onFocus={animateOnHover ? () => setAnimate(true) : undefined}
        onBlur={animateOnHover ? () => setAnimate(false) : undefined}
        onPointerDown={animateOnTap ? replay : undefined}
      >
        {children}
      </span>
    </AnimateContext.Provider>
  )
}

function IconSvg({ size = 18, className, children, ...rest }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('anim-svg', className)}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

const fillOrigin = { transformBox: 'fill-box', transformOrigin: 'center' } as const

const draw: Variants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: { pathLength: [0, 1], opacity: [0.35, 1] },
}

export function AnimatedCheck(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.path
        d="M20 6 9 17l-5-5"
        variants={draw}
        initial={false}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.42, ease: 'easeOut' }}
      />
    </IconSvg>
  )
}

export function AnimatedMinus(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.path
        d="M5 12h14"
        variants={draw}
        initial={false}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </IconSvg>
  )
}

export function AnimatedPlus(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.g
        style={fillOrigin}
        variants={{ normal: { rotate: 0 }, animate: { rotate: 90 } }}
        initial={false}
        animate={animate ? 'animate' : 'normal'}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </motion.g>
    </IconSvg>
  )
}

export function AnimatedAlert(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.g
        style={fillOrigin}
        variants={{ normal: { rotate: 0 }, animate: { rotate: [0, -8, 8, -5, 0] } }}
        initial={false}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </motion.g>
    </IconSvg>
  )
}

export function AnimatedSun(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.circle
        cx="12"
        cy="12"
        r="4"
        style={fillOrigin}
        variants={{ normal: { scale: 1 }, animate: { scale: [1, 1.18, 1] } }}
        initial={false}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <motion.g
        style={fillOrigin}
        variants={{ normal: { rotate: 0 }, animate: { rotate: 90 } }}
        initial={false}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
      >
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </motion.g>
    </IconSvg>
  )
}

export function AnimatedMoon(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.g
        style={fillOrigin}
        variants={{ normal: { rotate: 0, y: 0 }, animate: { rotate: -26, y: 1 } }}
        initial={false}
        animate={animate ? 'animate' : 'normal'}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </motion.g>
    </IconSvg>
  )
}

export function AnimatedMenu(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.path
        d="M4 6h16"
        initial={false}
        variants={{ normal: { x: 0 }, animate: { x: 3 } }}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <motion.path
        d="M4 12h16"
        style={fillOrigin}
        initial={false}
        variants={{ normal: { scaleX: 1 }, animate: { scaleX: 0.7 } }}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <motion.path
        d="M4 18h16"
        initial={false}
        variants={{ normal: { x: 0 }, animate: { x: -3 } }}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
    </IconSvg>
  )
}

export function AnimatedX(props: IconProps) {
  const animate = useContext(AnimateContext)
  return (
    <IconSvg {...props}>
      <motion.g
        style={fillOrigin}
        initial={false}
        variants={{ normal: { rotate: 0 }, animate: { rotate: 90 } }}
        animate={animate ? 'animate' : 'normal'}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </motion.g>
    </IconSvg>
  )
}
