import type { ReactNode } from 'react'
import { CostScene, FitScene, FollowScene, MeasureScene, PracticeScene, ReplayScene, ScaleScene, TimeScene } from './scenes'

/** One scene per row of `how.compare`, in the same order, with how long it plays (ms). */
export const scenes: { Scene: (props: { onHold?: () => void }) => ReactNode; ms: number }[] = [
  { Scene: TimeScene, ms: 7000 },
  { Scene: FitScene, ms: 7500 },
  { Scene: PracticeScene, ms: 11500 },
  { Scene: ScaleScene, ms: 8500 },
  { Scene: ReplayScene, ms: 8000 },
  { Scene: MeasureScene, ms: 14500 },
  { Scene: FollowScene, ms: 8000 },
  { Scene: CostScene, ms: 7000 },
]
