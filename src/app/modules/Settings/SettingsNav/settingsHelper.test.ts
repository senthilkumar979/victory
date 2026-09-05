import { describe, expect, it } from 'vitest'

import { findFirstEnabledValue, findNextEnabledIndex } from './settingsHelper'
import type { SettingsNavItem } from './SettingNav.types'

const items: SettingsNavItem[] = [
  { value: 'general', label: 'General', content: null, disabled: true },
  { value: 'queries', label: 'Queries', content: null },
  { value: 'danger', label: 'Danger', content: null, disabled: true },
  { value: 'email', label: 'Email', content: null },
]

describe('findFirstEnabledValue', () => {
  it('skips disabled items and returns undefined when none are enabled', () => {
    expect(findFirstEnabledValue(items)).toBe('queries')
    expect(
      findFirstEnabledValue([{ value: 'x', label: 'X', content: null, disabled: true }]),
    ).toBeUndefined()
  })
})

describe('findNextEnabledIndex', () => {
  it('wraps forward and backward across disabled items', () => {
    expect(findNextEnabledIndex(items, 1, 1)).toBe(3)
    expect(findNextEnabledIndex(items, 3, 1)).toBe(1)
    expect(findNextEnabledIndex(items, 1, -1)).toBe(3)
  })

  it('clamps an out-of-range start and returns -1 when nothing is enabled', () => {
    expect(findNextEnabledIndex(items, -4, 1)).toBe(1)
    expect(findNextEnabledIndex([], 0, 1)).toBe(-1)
    expect(
      findNextEnabledIndex(
        [{ value: 'x', label: 'X', content: null, disabled: true }],
        0,
        1,
      ),
    ).toBe(-1)
  })
})
