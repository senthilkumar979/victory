import { describe, expect, it } from 'vitest'

import { COMPANY_LOGOS } from '@/constants/CompanyConstants'

import { CARDS } from './data'

describe('homepage transformation company logos', () => {
  it('resolves every hired company with the exact name match the hero uses', () => {
    const missing = CARDS.filter((card) => {
      const logo = COMPANY_LOGOS.find(
        (company) => company.name === card.professionalCompany,
      )?.logo
      return typeof logo !== 'string' || logo.length === 0
    }).map((card) => card.professionalCompany)

    expect(CARDS.length).toBeGreaterThan(0)
    expect(missing).toEqual([])
  })
})
