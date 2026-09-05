import { describe, expect, it } from 'vitest'

import {
  formatSubmissionRating,
  hasSubmissionFeedback,
} from './SubmissionRatingDisplay'

describe('formatSubmissionRating', () => {
  it('drops a trailing .0 so whole scores stay compact', () => {
    expect(formatSubmissionRating(4)).toBe('4 / 5')
    expect(formatSubmissionRating(4.0)).toBe('4 / 5')
  })

  it('rounds to one decimal place', () => {
    expect(formatSubmissionRating(4.25)).toBe('4.3 / 5')
    expect(formatSubmissionRating(4.24)).toBe('4.2 / 5')
  })
})

describe('hasSubmissionFeedback', () => {
  it('treats a zero rating as submitted feedback, not a missing score', () => {
    expect(hasSubmissionFeedback({ rating: 0 })).toBe(true)
    expect(hasSubmissionFeedback({ rating: 4 })).toBe(true)
  })

  it('treats null as no feedback', () => {
    expect(hasSubmissionFeedback({ rating: null })).toBe(false)
  })
})
