import { describe, expect, it } from 'vitest'

import {
  MAX_AUTHOR_SUGGESTIONS,
  filterAuthorsByPrefix,
} from './blogAuthorFilter'

describe('filterAuthorsByPrefix', () => {
  const authors = [
    'Zoe Miles',
    'ada lovelace',
    'Ada Lovelace',
    'Bob',
    '   ',
    ...Array.from({ length: 12 }, (_, i) => `Ann ${String(i).padStart(2, '0')}`),
  ]

  it('returns no suggestions for empty or whitespace queries', () => {
    expect(filterAuthorsByPrefix(authors, '')).toEqual([])
    expect(filterAuthorsByPrefix(authors, '   ')).toEqual([])
  })

  it('matches a case-insensitive prefix, sorts, and caps results', () => {
    expect(filterAuthorsByPrefix(authors, ' ADA ')).toEqual([
      'ada lovelace',
      'Ada Lovelace',
    ])

    const anns = filterAuthorsByPrefix(authors, 'ann')
    expect(anns).toHaveLength(MAX_AUTHOR_SUGGESTIONS)
    expect(anns[0]).toBe('Ann 00')
    expect(anns.at(-1)).toBe('Ann 09')
    expect(anns).not.toContain('Ann 10')
  })
})
