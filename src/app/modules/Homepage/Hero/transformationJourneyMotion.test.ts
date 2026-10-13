import { describe, expect, it } from 'vitest'

import {
  cardSwapTransition,
  getHiredLineVariants,
  getHiredStagger,
  getStudentLineVariants,
  getStudentStagger,
  gridExpandTransition,
} from './transformationJourneyMotion'

describe('transformationJourneyMotion', () => {
  it('collapses travel, blur, and stagger when motion is reduced', () => {
    expect(cardSwapTransition(true)).toEqual({ duration: 0.2 })
    expect(gridExpandTransition(true)).toEqual({ duration: 0.2 })

    expect(getStudentStagger(true).show).toMatchObject({
      transition: { staggerChildren: 0, delayChildren: 0 },
    })
    expect(getStudentLineVariants(true).hidden).toEqual({ opacity: 0 })
    expect(getStudentLineVariants(true).show).toEqual({
      opacity: 1,
      transition: { duration: 0.15 },
    })

    expect(getHiredStagger(true).show).toMatchObject({
      transition: { staggerChildren: 0, delayChildren: 0 },
    })
    expect(getHiredLineVariants(true).hidden).toEqual({ opacity: 0 })
    expect(getHiredLineVariants(true).show).toEqual({
      opacity: 1,
      transition: { duration: 0.15 },
    })
  })

  it('keeps the spring offsets used by the full journey', () => {
    expect(cardSwapTransition(false)).toMatchObject({ type: 'spring' })
    expect(gridExpandTransition(false)).toMatchObject({
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1],
    })

    expect(getStudentStagger(false).hidden).toMatchObject({ opacity: 1 })
    expect(getStudentStagger(false).show).toMatchObject({
      transition: { staggerChildren: 0.055, delayChildren: 0.08 },
    })
    expect(getStudentLineVariants(false).hidden).toMatchObject({
      opacity: 0,
      y: 18,
      filter: 'blur(8px)',
    })

    expect(getHiredStagger(false).hidden).toMatchObject({ opacity: 0, y: 16 })
    expect(getHiredStagger(false).show).toMatchObject({
      transition: { staggerChildren: 0.07, delayChildren: 0.12 },
    })
    expect(getHiredLineVariants(false).hidden).toMatchObject({
      opacity: 0,
      x: 16,
      filter: 'blur(6px)',
    })
  })
})
