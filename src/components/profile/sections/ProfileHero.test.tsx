import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { COMPANY_LOGOS } from '@/constants/CompanyConstants'
import type { ProfileData } from '@/types/student.types'

import { ProfileHero } from './ProfileHero'

vi.mock('next/image', () => ({
  default: function Image({ alt, src }: { alt: string; src?: string }) {
    return <span data-alt={alt} data-src={src ?? ''} />
  },
}))

vi.mock('@/components/ui/fancy-text', () => ({
  FancyText: function FancyText({ children }: { children: string }) {
    return <span>{children}</span>
  },
}))

const frigateLogo = COMPANY_LOGOS.find((company) => company.name === 'Frigate')?.logo

function makeStudent(overrides: Partial<ProfileData> = {}): ProfileData {
  return {
    id: 'student-1',
    name: 'Ada Lovelace',
    picture: 'https://example.com/ada.png',
    role: 'Engineer',
    company: 'frigate',
    email: 'ada@mentorbridge.in',
    batch: '4',
    socialLinks: {
      linkedIn: 'https://linkedin.com/in/ada',
      gitHub: 'https://github.com/ada',
      website: 'https://ada.example',
    },
    resumeLink: 'https://example.com/resume.pdf',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('ProfileHero', () => {
  it('matches the company logo case-insensitively and exposes contact links', () => {
    render(<ProfileHero student={makeStudent()} />)

    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
      'src',
      'https://example.com/ada.png',
    )
    expect(screen.getByText('Cohort 4')).toBeInTheDocument()
    expect(document.querySelector('[data-alt="frigate"]')).toHaveAttribute(
      'data-src',
      frigateLogo,
    )
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://linkedin.com/in/ada',
    )
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/ada',
    )
    expect(screen.getByRole('link', { name: 'Website' })).toHaveAttribute(
      'href',
      'https://ada.example',
    )
    expect(screen.getByRole('link', { name: /view resume/i })).toHaveAttribute(
      'href',
      'https://example.com/resume.pdf',
    )
    expect(screen.getAllByRole('link', { name: 'ada@mentorbridge.in' })).toHaveLength(1)
    expect(screen.getByRole('link', { name: /contact/i })).toHaveAttribute(
      'href',
      'mailto:ada@mentorbridge.in',
    )
  })

  it('hides the logo, cohort, and links when those fields are absent', () => {
    render(
      <ProfileHero
        student={makeStudent({
          name: 'Ada Lovelace',
          picture: '',
          company: 'MentorBridge',
          batch: '',
          email: '',
          socialLinks: undefined,
          resumeLink: '',
        })}
      />,
    )

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(document.querySelector('[data-alt]')).not.toBeInTheDocument()
    expect(screen.getAllByText('MentorBridge')).toHaveLength(2)
    expect(screen.queryByText(/cohort/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'GitHub' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Website' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /view resume/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /contact/i })).not.toBeInTheDocument()
  })

  it('treats only the exact MentorBridge company name as the no-logo case', () => {
    render(<ProfileHero student={makeStudent({ company: 'mentorbridge' })} />)

    expect(document.querySelector('[data-alt="mentorbridge"]')).toHaveAttribute(
      'data-src',
      '',
    )
  })
})
