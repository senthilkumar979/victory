import { describe, expect, it } from 'vitest'

import { verticalSteps } from './learningDimensionsContent'
import { verticalIconMap } from './verticalMasteryIcons'
import { nodePulse, stepItem } from './verticalMasteryMotion'

describe('vertical mastery motion', () => {
  it('keeps steps from sliding when reduced motion is requested', () => {
    expect(stepItem(true).hidden).toMatchObject({ opacity: 0, y: 0 })
    expect(stepItem(false).hidden).toMatchObject({ opacity: 0, y: 18 })
  })

  it('does not pulse nodes when reduced motion is requested', () => {
    expect(nodePulse(true).show).toMatchObject({ scale: [1, 1, 1], opacity: 1 })
    expect(nodePulse(false).show).toMatchObject({
      scale: [1, 1.2, 1],
      opacity: 1,
    })
  })

  it('maps every track icon to a component', () => {
    expect(verticalSteps.length).toBeGreaterThan(0)
    for (const step of verticalSteps) {
      expect(verticalIconMap[step.icon]).toBeTruthy()
    }
  })
})
