import { describe, expect, it } from 'vitest'

import {
  SESSION_VIDEO_CATEGORIES,
  SESSION_VIDEO_CATEGORY_LABELS,
  SESSION_VIDEO_CATEGORY_OPTIONS,
  getSessionVideoCategoryLabel,
  type SessionVideoCategory,
} from './sessionVideoCategories'

describe('getSessionVideoCategoryLabel', () => {
  it('returns the display label for every known category', () => {
    for (const option of SESSION_VIDEO_CATEGORY_OPTIONS) {
      expect(getSessionVideoCategoryLabel(option.value)).toBe(option.label)
      expect(SESSION_VIDEO_CATEGORY_LABELS[option.value]).toBe(option.label)
    }
  })

  it('falls back to the raw category value when a label is missing', () => {
    expect(
      getSessionVideoCategoryLabel(
        'unknown_session' as SessionVideoCategory,
      ),
    ).toBe('unknown_session')
  })

  it('keeps option values aligned with the category constants', () => {
    const optionValues = SESSION_VIDEO_CATEGORY_OPTIONS.map((o) => o.value)
    expect(optionValues).toEqual(Object.values(SESSION_VIDEO_CATEGORIES))
  })
})
