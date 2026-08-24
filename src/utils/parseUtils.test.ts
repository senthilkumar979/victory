import { afterEach, describe, expect, it, vi } from 'vitest'

import { safeJsonParse } from './parseUtils'

describe('safeJsonParse', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns the fallback for falsy values including empty strings', () => {
    expect(safeJsonParse(null, [])).toEqual([])
    expect(safeJsonParse(undefined, {})).toEqual({})
    expect(safeJsonParse('', [])).toEqual([])
    expect(safeJsonParse(0, 'fallback')).toBe('fallback')
    expect(safeJsonParse(false, 'fallback')).toBe('fallback')
  })

  it('returns already-parsed objects and arrays without re-parsing', () => {
    const skills = ['React']
    const links = { gitHub: 'https://github.com/ada' }

    expect(safeJsonParse(skills, [])).toBe(skills)
    expect(safeJsonParse(links, {})).toBe(links)
  })

  it('parses valid JSON strings and uses the default null fallback', () => {
    expect(safeJsonParse('["a","b"]')).toEqual(['a', 'b'])
    expect(safeJsonParse('{"role":"Dev"}')).toEqual({ role: 'Dev' })
    expect(safeJsonParse(1)).toBeNull()
  })

  it('returns the fallback and warns when a string is not valid JSON', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    expect(safeJsonParse('{not-json', [])).toEqual([])
    expect(warn).toHaveBeenCalled()
  })
})
