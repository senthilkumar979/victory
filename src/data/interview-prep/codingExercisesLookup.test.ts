import { describe, expect, it } from 'vitest'

import { getCodingExercisesForTrack } from './coding-exercises'

const TRACK_SLUGS = [
  'core-java',
  'javascript',
  'react',
  'spring-boot',
  'typescript',
] as const

describe('getCodingExercisesForTrack', () => {
  it('returns no exercises for roadmap slugs and unknown keys', () => {
    expect(getCodingExercisesForTrack('java')).toEqual([])
    expect(getCodingExercisesForTrack('')).toEqual([])
    expect(getCodingExercisesForTrack('unknown')).toEqual([])
  })

  it('returns a unique non-empty exercise list for each interview track', () => {
    for (const slug of TRACK_SLUGS) {
      const exercises = getCodingExercisesForTrack(slug)
      expect(exercises.length).toBeGreaterThan(0)

      const ids = exercises.map((exercise) => exercise.id)
      expect(new Set(ids).size).toBe(ids.length)

      for (const exercise of exercises) {
        expect(exercise.title.trim().length).toBeGreaterThan(0)
        expect(exercise.hints.length).toBeGreaterThan(0)
        expect(exercise.answerFiles.length).toBeGreaterThan(0)
        expect(['beginner', 'mid']).toContain(exercise.difficulty)
      }
    }
  })
})
