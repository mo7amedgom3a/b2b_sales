import { useRef } from 'react'
import { useScrollFx } from './motion/useScrollFx'
import { Logos } from './sections/Logos'
import { Problem } from './sections/Problem'
import { HowWeWork } from './sections/HowWeWork'
import { Paths } from './sections/Paths'
import { AI } from './sections/AI'
import { Reports } from './sections/Reports'
import { SuccessStory } from './sections/SuccessStory'
import { Trainers } from './sections/Trainers'
import { Pricing } from './sections/Pricing'
import { Faq } from './sections/Faq'
import { Booking } from './sections/Booking'

/** Everything below the hero is one deferred chunk, so the first paint only pays for the hero. */
export default function Below() {
  const rootRef = useRef<HTMLDivElement>(null)
  useScrollFx(rootRef)

  return (
    <div className="below" ref={rootRef}>
      <Logos />
      <Problem />
      <HowWeWork />
      <Paths />
      <AI />
      <Reports />
      <SuccessStory />
      <Trainers />
      <Pricing />
      <Faq />
      <Booking />
    </div>
  )
}
