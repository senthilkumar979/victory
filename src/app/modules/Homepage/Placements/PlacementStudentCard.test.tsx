import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PlacementStudentCard } from './PlacementStudentCard'

vi.mock('motion/react', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag) => (typeof tag === 'string' ? tag : undefined),
    },
  ),
  useReducedMotion: () => true,
}))

vi.mock('next/image', () => ({
  default: ({
    alt,
    priority,
  }: {
    alt: string
    priority?: boolean
  }) => <span data-alt={alt} data-priority={priority ? 'true' : 'false'} />,
}))

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: ReactNode
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

const student = {
  id: 'stu-1',
  name: 'ada lovelace',
  picture: 'https://cdn.example/ada.png',
  role: 'Engineer',
  company: 'Codifi',
  batch: 2025,
}

describe('PlacementStudentCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('links to the student profile and prioritizes the first photos', () => {
    const { rerender } = render(
      <PlacementStudentCard student={student} index={2} />,
    )

    expect(screen.getByRole('link', { name: 'View profile: ada lovelace' })).toHaveAttribute(
      'href',
      '/students/stu-1',
    )
    expect(screen.getByText('Engineer')).toBeInTheDocument()
    expect(screen.getByText('Codifi')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()
    expect(document.querySelector('[data-alt="ada lovelace"]')).toHaveAttribute(
      'data-priority',
      'true',
    )

    rerender(<PlacementStudentCard student={student} index={3} />)

    expect(document.querySelector('[data-alt="ada lovelace"]')).toHaveAttribute(
      'data-priority',
      'false',
    )
  })

  it('uses an initial and hides empty placement fields', () => {
    render(
      <PlacementStudentCard
        student={{
          ...student,
          picture: '',
          role: '',
          company: '',
          batch: 0,
        }}
        index={0}
      />,
    )

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(document.querySelector('[data-alt]')).not.toBeInTheDocument()
    expect(screen.queryByText('Engineer')).not.toBeInTheDocument()
    expect(screen.queryByText('Codifi')).not.toBeInTheDocument()
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('keeps a whitespace company because the gate does not trim', () => {
    render(
      <PlacementStudentCard
        student={{ ...student, picture: '', company: '   ' }}
        index={4}
      />,
    )

    expect(document.querySelector('.text-info')?.textContent).toBe('   ')
  })
})
