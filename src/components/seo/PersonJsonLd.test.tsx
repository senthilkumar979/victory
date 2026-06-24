import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PersonJsonLd } from './PersonJsonLd'

import type { StudentSeoRow } from '@/lib/seo/getStudentForSeo'

function readJsonLd(container: HTMLElement): Record<string, unknown> {
  const script = container.querySelector('script[type="application/ld+json"]')
  expect(script).not.toBeNull()
  return JSON.parse(script?.innerHTML ?? '{}') as Record<string, unknown>
}

function makeStudent(overrides: Partial<StudentSeoRow> = {}): StudentSeoRow {
  return {
    id: 'ada-lovelace',
    name: 'Ada Lovelace',
    summary: 'Building reliable public student profiles.',
    picture: 'https://cdn.example.com/ada.png',
    role: 'Software Engineer',
    company: 'Analytical Engines',
    batch: '2026',
    ...overrides,
  }
}

describe('PersonJsonLd', () => {
  it('renders profile structured data with canonical student and organization URLs', () => {
    const { container } = render(<PersonJsonLd student={makeStudent()} />)

    expect(readJsonLd(container)).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ada Lovelace',
        url: 'https://www.mentorbridge.in/students/ada-lovelace',
        image: 'https://cdn.example.com/ada.png',
        jobTitle: 'Software Engineer',
        description: 'Building reliable public student profiles.',
        worksFor: {
          '@type': 'Organization',
          name: 'Analytical Engines',
        },
        memberOf: {
          '@type': 'Organization',
          name: 'MentorBridge',
          url: 'https://www.mentorbridge.in',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': 'https://www.mentorbridge.in/students/ada-lovelace',
        },
      }),
    )
  })

  it('omits nullable optional profile fields from the JSON-LD payload', () => {
    const { container } = render(
      <PersonJsonLd
        student={makeStudent({
          summary: null,
          picture: null,
          role: null,
          company: null,
        })}
      />,
    )

    const json = readJsonLd(container)
    expect(json).not.toHaveProperty('description')
    expect(json).not.toHaveProperty('image')
    expect(json).not.toHaveProperty('jobTitle')
    expect(json).not.toHaveProperty('worksFor')
  })
})
