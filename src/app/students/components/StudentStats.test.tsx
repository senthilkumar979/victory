import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'

import { StudentStats } from './StudentStats'

vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
  },
}))

vi.mock('@/components/profile/AnimatedCounter', () => ({
  AnimatedCounter: ({ value }: { value: number }) => <span>{value}</span>,
}))

function student(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 'student-1',
    name: 'Ada',
    picture: '',
    role: 'Student',
    email: 'ada@example.com',
    batch: '2024',
    ...overrides,
  }
}

function statValue(label: string): string {
  const labelNode = screen.getByText(label)
  const valueNode = labelNode.previousElementSibling
  return valueNode?.textContent ?? ''
}

afterEach(() => {
  cleanup()
})

describe('StudentStats', () => {
  it('shows zero counts and N/A when there are no students', () => {
    render(<StudentStats students={[]} />)

    expect(statValue('Total Students')).toBe('0')
    expect(statValue('Male')).toBe('0')
    expect(statValue('Female')).toBe('0')
    expect(statValue('M:F Ratio')).toBe('N/A')
  })

  it('counts gender aliases and reduces the ratio by their greatest common divisor', () => {
    render(
      <StudentStats
        students={[
          student({ id: '1', gender: 'm' }),
          student({ id: '2', gender: 'MALE' }),
          student({ id: '3', gender: 'f' }),
          student({ id: '4', gender: 'Female' }),
          student({ id: '5', gender: 'other' }),
          student({ id: '6' }),
        ]}
      />,
    )

    expect(statValue('Total Students')).toBe('6')
    expect(statValue('Male')).toBe('2')
    expect(statValue('Female')).toBe('2')
    expect(statValue('M:F Ratio')).toBe('1:1')
  })

  it('keeps a zero side of the ratio when every counted student is one gender', () => {
    const { rerender } = render(
      <StudentStats
        students={[
          student({ id: '1', gender: 'Male' }),
          student({ id: '2', gender: 'M' }),
          student({ id: '3', gender: 'male' }),
        ]}
      />,
    )

    expect(statValue('Male')).toBe('3')
    expect(statValue('Female')).toBe('0')
    expect(statValue('M:F Ratio')).toBe('3:0')

    rerender(
      <StudentStats
        students={[
          student({ id: '1', gender: 'F' }),
          student({ id: '2', gender: 'female' }),
        ]}
      />,
    )

    expect(statValue('Male')).toBe('0')
    expect(statValue('Female')).toBe('2')
    expect(statValue('M:F Ratio')).toBe('0:2')
  })

  it('reduces uneven counts and ignores untrimmed gender text', () => {
    render(
      <StudentStats
        students={[
          student({ id: '1', gender: 'male' }),
          student({ id: '2', gender: 'male' }),
          student({ id: '3', gender: 'male' }),
          student({ id: '4', gender: 'male' }),
          student({ id: '5', gender: 'female' }),
          student({ id: '6', gender: 'female' }),
          student({ id: '7', gender: ' male ' }),
        ]}
      />,
    )

    expect(statValue('Total Students')).toBe('7')
    expect(statValue('Male')).toBe('4')
    expect(statValue('Female')).toBe('2')
    expect(statValue('M:F Ratio')).toBe('2:1')
  })
})
