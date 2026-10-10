import { describe, expect, it } from 'vitest'

import {
  DT_BRANCHES,
  DT_CX,
  DT_MAIN,
  DT_MAIN_H,
  DT_MAIN_W,
  DT_TOP,
  dtMainX0,
  dtMainY,
} from './designThinkingLayout'

describe('designThinkingLayout', () => {
  it('starts the spine at the top inset and steps by node height plus gap', () => {
    expect(dtMainY(0)).toBe(DT_TOP)
    expect(dtMainY(1)).toBeCloseTo(DT_TOP + DT_MAIN_H + 26)
  })

  it('keeps consecutive main nodes from overlapping', () => {
    for (let index = 0; index < DT_MAIN.length - 1; index += 1) {
      expect(dtMainY(index + 1)).toBeGreaterThanOrEqual(dtMainY(index) + DT_MAIN_H)
    }
  })

  it('centers the main column in the view box', () => {
    expect(dtMainX0()).toBeCloseTo(DT_CX - DT_MAIN_W / 2)
  })

  it('keeps every branch attached to a real main node', () => {
    const ids = new Set<string>()

    for (const branch of DT_BRANCHES) {
      expect(ids.has(branch.id)).toBe(false)
      ids.add(branch.id)
      expect(branch.mainIndex).toBeGreaterThanOrEqual(0)
      expect(branch.mainIndex).toBeLessThan(DT_MAIN.length)
      expect(branch.side === 'left' || branch.side === 'right').toBe(true)
    }
  })
})
