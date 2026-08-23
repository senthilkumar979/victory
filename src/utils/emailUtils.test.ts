import { describe, expect, it } from 'vitest'

import { parseEmails } from './emailUtils'

describe('parseEmails', () => {
  it('splits, lowercases, and de-duplicates mixed delimiters', () => {
    expect(
      parseEmails('Ada@Example.com, grace@example.com; ADA@example.com\n alan@example.com'),
    ).toEqual(['ada@example.com', 'grace@example.com', 'alan@example.com'])
  })

  it('drops invalid tokens and empty segments', () => {
    expect(parseEmails('  not-an-email  ,,\tfoo@, @bar.com, good@example.com  ')).toEqual([
      'good@example.com',
    ])
  })

  it('returns an empty list for blank input', () => {
    expect(parseEmails('   \n\t')).toEqual([])
  })
})
