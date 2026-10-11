import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ReactNode } from 'react'

import type { ProfileData } from '@/types/student.types'

import { StudentCard } from './StudentCard'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span data-alt={alt} data-src={src} />
  ),
}))

vi.mock('framer-motion', () => {
  const motion = new Proxy({}, {
    get: (_target, tag) => {
      function MotionTag({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) {
        const rest = { ...props }
        for (const key of ['initial', 'animate', 'exit', 'transition', 'variants', 'whileHover', 'whileTap']) {
          delete rest[key]
        }
        const Tag = tag as 'div'
        return <Tag {...(rest as Record<string, string>)}>{children}</Tag>
      }
      MotionTag.displayName = `motion.${String(tag)}`
      return MotionTag
    },
  })
  function AnimatePresence({ children }: { children?: ReactNode }) {
    return children
  }
  return { motion, AnimatePresence }
})

function makeStudent(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 'stu-1',
    name: 'ada lovelace',
    picture: '',
    role: 'Engineer',
    company: 'Acme',
    email: 'ada@mentorbridge.in',
    batch: '2026',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('StudentCard', () => {
  it('links to the profile and shows an initial when there is no photo', () => {
    render(<StudentCard student={makeStudent()} index={0} />)

    expect(screen.getByRole('link', { name: /ada lovelace/i })).toHaveAttribute(
      'href',
      '/students/stu-1',
    )
    expect(screen.getAllByText('A')).toHaveLength(2)
  })

  it('renders the photo and hides the initial when a picture url is set', () => {
    render(
      <StudentCard student={makeStudent({ picture: 'https://cdn.example/ada.png' })} index={0} />,
    )

    const photos = document.querySelectorAll('[data-alt="ada lovelace"]')
    expect(photos).toHaveLength(2)
    expect(photos[0]).toHaveAttribute('data-src', 'https://cdn.example/ada.png')
    expect(screen.queryByText('A')).toBeNull()
  })

  it('falls back to MentorBridge and hides an empty role or batch', () => {
    render(
      <StudentCard student={makeStudent({ company: undefined, role: '', batch: '' })} index={0} />,
    )

    expect(screen.getByText('MentorBridge')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 6 })).toBeNull()
    expect(screen.queryByText('2026')).toBeNull()
  })

  it('keeps a whitespace company and shows role and batch when they are set', () => {
    const { container } = render(
      <StudentCard student={makeStudent({ company: '   ', role: 'Engineer', batch: '2026' })} index={1} />,
    )

    expect(container.textContent).toContain('   ')
    expect(container.textContent).not.toContain('MentorBridge')
    expect(screen.getByRole('heading', { level: 6, name: 'Engineer' })).toBeInTheDocument()
    expect(screen.getByText('2026')).toBeInTheDocument()
  })

  it('shows social links only when a profile url is present, without bubbling the click', () => {
    const { rerender } = render(
      <StudentCard student={makeStudent({ socialLinks: { linkedIn: '', gitHub: '', website: '' } })} index={0} />,
    )
    expect(screen.queryByRole('link', { name: 'LinkedIn profile' })).toBeNull()

    const parentClicks = vi.fn()
    rerender(
      <div onClick={parentClicks}>
        <StudentCard
          student={makeStudent({
            socialLinks: { linkedIn: 'https://linkedin.com/in/ada', gitHub: '', website: 'https://ada.dev' },
          })}
          index={0}
        />
      </div>,
    )

    expect(screen.getByRole('link', { name: 'Personal website' })).toHaveAttribute('href', 'https://ada.dev')
    fireEvent.click(screen.getByRole('link', { name: 'LinkedIn profile' }))
    expect(parentClicks).not.toHaveBeenCalled()
  })
})
