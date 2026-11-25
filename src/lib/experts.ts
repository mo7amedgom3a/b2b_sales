import { trainers } from '../content/ar'
import type { ApiExpert } from './api'

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

function normalize(name: string): string {
  return name
    .replace(/^(أ\.|د\.|م\.|أ|د|م)\s*/u, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function findExpert(api: ApiExpert[], name: string): ApiExpert | undefined {
  const target = normalize(name)
  return api.find((expert) => {
    const candidate = normalize(expert.name)
    return candidate === target || candidate.includes(target) || target.includes(candidate)
  })
}

/** Keep the README line-up and enrich it with the live expert profiles. */
export function mergeTrainers(api: ApiExpert[]): TrainerCard[] {
  return trainers.people.map((person) => {
    const match = findExpert(api, person.name)
    return {
      name: person.name,
      role: person.role,
      initial: person.initial,
      tone: person.tone,
      photo: match?.avatar ?? person.photo,
      category: match?.categories?.[0],
      courses: match?.course_count,
      diplomas: match?.diploma_count,
      live: Boolean(match),
      founder: person.founder,
      title: person.title,
      bio: person.bio,
      focus: person.focus,
      profile: person.profile,
    }
  })
}
