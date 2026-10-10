import { describe, expect, it } from 'vitest'

import { codingDifficultyMeta } from './codingExerciseDifficulty'

describe('codingDifficultyMeta', () => {
  it('labels beginner exercises and uses the emerald scale', () => {
    const meta = codingDifficultyMeta('beginner')

    expect(meta.label).toBe('Beginner')
    expect(meta.chip).toContain('emerald')
    expect(meta.bar).toContain('emerald')
  })

  it('labels mid-level exercises and uses the sky scale', () => {
    const meta = codingDifficultyMeta('mid')

    expect(meta.label).toBe('Mid-level')
    expect(meta.chip).toContain('sky')
    expect(meta.bar).not.toContain('emerald')
  })
})
