import { JAVASCRIPT_CODING_EXERCISES } from './javascript'
import type { CodingExercise } from './types'

const BY_SLUG: Record<string, CodingExercise[]> = {
  javascript: JAVASCRIPT_CODING_EXERCISES,
}

export function getCodingExercisesForTrack(slug: string): CodingExercise[] {
  return BY_SLUG[slug] ?? []
}

export type { CodingAnswerFile, CodingDifficulty, CodingExercise } from './types'
