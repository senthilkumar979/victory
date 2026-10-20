import { describe, expect, it } from 'vitest'

import {
  cardVariants,
  floatLoop,
  pillarCardHover,
} from './horizontalPillarMotion'

describe('horizontal pillar motion', () => {
  it('keeps cards at full scale when reduced motion is requested', () => {
    expect(cardVariants(true).hidden).toMatchObject({ opacity: 0, scale: 1 })
    expect(cardVariants(false).hidden).toMatchObject({ opacity: 0, scale: 0.94 })
  })

  it('disables the infinite float loop when reduced motion is requested', () => {
    expect(floatLoop(true)).toBe(false)
    expect(floatLoop(false)).toMatchObject({
      y: [0, -5, 0],
      transition: { repeat: Infinity },
    })
  })

  it('drops hover scale and glow when reduced motion is requested', () => {
    expect(pillarCardHover(true)).toBeUndefined()
    expect(pillarCardHover(false)).toEqual({
      scale: 1.05,
      boxShadow: '0 0 28px 2px rgba(212, 59, 246, 0.28)',
    })
  })
})
