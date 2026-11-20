import { Logos } from './sections/Logos'
import { Problem } from './sections/Problem'
import { VideoBreak } from './sections/VideoBreak'
import { HowWeWork } from './sections/HowWeWork'
import { Paths } from './sections/Paths'
import { Library } from './sections/Library'
import { AI } from './sections/AI'
import { Reports } from './sections/Reports'
import { SuccessStory } from './sections/SuccessStory'
import { Trainers } from './sections/Trainers'
import { Pricing } from './sections/Pricing'
import { Faq } from './sections/Faq'
import { Booking } from './sections/Booking'

/** Everything below the hero is one deferred chunk, so the first paint only pays for the hero. */
export default function Below() {
  return (
    <>
      <Logos />
      <Problem />
      <VideoBreak />
      <HowWeWork />
      <Paths />
      <Library />
      <AI />
      <Reports />
      <SuccessStory />
      <Trainers />
      <Pricing />
      <Faq />
      <Booking />
    </>
  )
}
