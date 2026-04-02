import { CORE_JAVA_CODING_EXERCISES } from './core-java'
import { JAVASCRIPT_CODING_EXERCISES } from './javascript'
import { REACT_CODING_EXERCISES } from './react'
import { SPRING_BOOT_CODING_EXERCISES } from './spring-boot'
import type { CodingExercise } from './types'

const BY_SLUG: Record<string, CodingExercise[]> = {
  'core-java': CORE_JAVA_CODING_EXERCISES,
  javascript: JAVASCRIPT_CODING_EXERCISES,
  react: REACT_CODING_EXERCISES,
  'spring-boot': SPRING_BOOT_CODING_EXERCISES,
}

export function getCodingExercisesForTrack(slug: string): CodingExercise[] {
  return BY_SLUG[slug] ?? []
}

export type { CodingAnswerFile, CodingDifficulty, CodingExercise } from './types'
