import { trainers } from '../content/ar'
import { b2bTrainersSnapshot } from '../content/b2bSnapshot'
import type { B2BTrainer } from './api'

export type TrainerCard = {
  name: string
  role: string
  initial: string
  tone: string
  photo?: string
  category?: string
  courses?: number
  diplomas?: number
  live: boolean
  /** Static expert-profile extras, shown on the founder cards and the video intro. */
  founder?: boolean
  title?: string
  bio?: string
  focus?: string[]
  profile?: string
}

const TONES = ['coral', 'sky', 'yellow', 'lilac', 'green'] as const
/** How many B2B trainers the team grid shows. */
export const TEAM_SIZE = 9

/** «أ. إبراهيم سلامة» → «إ». */
function initialOf(name: string) {
  return name.replace(/^(أ\.|د\.|م\.|د\.\s*م\.)\s*/u, '').trim().charAt(0) || name.charAt(0)
}

function fromB2B(trainer: B2BTrainer, index: number, live: boolean): TrainerCard {
  return {
    name: trainer.name,
    role: 'مدرب في مكتبة ماستري للأعمال',
    initial: initialOf(trainer.name),
    tone: TONES[index % TONES.length],
    photo: trainer.avatar ?? undefined,
    category: trainer.topCategory ?? undefined,
    courses: trainer.programs,
    live,
  }
}

/**
 * The academy's founders (static profiles) followed by the B2B library's
 * trainers: live from `/b2b/courses` when available, otherwise the bundled
 * B2B snapshot. No B2C expert data is used.
 */
export function mergeTrainers(b2b: B2BTrainer[]): TrainerCard[] {
  const founders: TrainerCard[] = trainers.people
    .filter((person) => person.founder)
    .map((person) => ({
      name: person.name,
      role: person.role,
      initial: person.initial,
      tone: person.tone,
      photo: person.photo,
      live: false,
      founder: true,
      title: person.title,
      bio: person.bio,
      focus: person.focus,
      profile: person.profile,
    }))
  const live = b2b.length > 0
  const team = (live ? b2b : b2bTrainersSnapshot).slice(0, TEAM_SIZE).map((trainer, i) => fromB2B(trainer, i, live))
  return [...founders, ...team]
}
