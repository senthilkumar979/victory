import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { StudentSeoRow } from '@/lib/seo/getStudentForSeo'

vi.mock('@/lib/siteUrl', () => ({
  SITE_URL: 'https://mentor.test',
}))

import { PersonJsonLd } from './PersonJsonLd'

function makeStudent(overrides: Partial<StudentSeoRow> = {}): StudentSeoRow {
  return {
    id: 'student-1',
    name: 'Ada Lovelace',
    summary: 'Builds reliable software.',
    picture: 'https://img.example.test/ada.png',
    role: 'Engineer',
    company: 'Analytical Engines',
    batch: '2026',
    ...overrides,
  }
}

describe('PersonJsonLd', () => {
  it('renders schema.org person data for student profiles', () => {
    const { container } = render(<PersonJsonLd student={makeStudent()} />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const json = JSON.parse(script?.innerHTML ?? '{}')

    expect(json).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Ada Lovelace',
      url: 'https://mentor.test/students/student-1',
      image: 'https://img.example.test/ada.png',
      jobTitle: 'Engineer',
      worksFor: {
        '@type': 'Organization',
        name: 'Analytical Engines',
      },
      memberOf: {
        '@type': 'Organization',
        name: 'MentorBridge',
        url: 'https://mentor.test',
      },
      description: 'Builds reliable software.',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': 'https://mentor.test/students/student-1',
      },
    })
  })

  it('omits optional fields when the student profile has no optional SEO data', () => {
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
    const script = container.querySelector('script[type="application/ld+json"]')
    const json = JSON.parse(script?.innerHTML ?? '{}')

    expect(json).not.toHaveProperty('image')
    expect(json).not.toHaveProperty('jobTitle')
    expect(json).not.toHaveProperty('worksFor')
    expect(json).not.toHaveProperty('description')
  })
})
