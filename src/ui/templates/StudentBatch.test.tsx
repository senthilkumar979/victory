import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { StudentBatch } from './StudentBatch'

afterEach(() => {
  cleanup()
})

function batchClass(year: number) {
  render(<StudentBatch batch={year} />)
  return screen.getByText(String(year)).className
}

describe('StudentBatch', () => {
  it('maps known cohort years to their color tokens', () => {
    expect(batchClass(2025)).toContain('text-primary')
    cleanup()
    expect(batchClass(2026)).toContain('text-secondary')
    cleanup()
    expect(batchClass(2027)).toContain('text-tertiary')
    cleanup()
    expect(batchClass(2028)).toContain('text-success')
    cleanup()
    expect(batchClass(2029)).toContain('text-warning')
    cleanup()
    expect(batchClass(2030)).toContain('text-error')
  })

  it('falls back to the neutral text token for unknown years', () => {
    expect(batchClass(0)).toContain('text-text')
    cleanup()
    expect(batchClass(2024)).toContain('text-text')
  })
})
