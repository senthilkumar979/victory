import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { StudentSeoRow } from '@/lib/seo/getStudentForSeo'

const { getStudentForSeoMock } = vi.hoisted(() => ({
  getStudentForSeoMock: vi.fn(),
}))

vi.mock('@/lib/siteUrl', () => ({
  SITE_URL: 'https://mentor.test',
}))

vi.mock('@/lib/seo/getStudentForSeo', () => ({
  getStudentForSeo: getStudentForSeoMock,
}))

vi.mock('@/components/seo/PersonJsonLd', () => ({
  PersonJsonLd: ({ student }: { student: StudentSeoRow }) => (
    <script data-testid="person-json-ld" data-student-id={student.id} />
  ),
}))

vi.mock('./StudentDetailPageClient', () => ({
  StudentDetailPageClient: ({ id }: { id: string }) => (
    <div data-testid="student-page-client">Student profile {id}</div>
  ),
}))

import StudentDetailPage, { generateMetadata } from './page'

function makeStudentSeoRow(
  overrides: Partial<StudentSeoRow> = {},
): StudentSeoRow {
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

function makeParams(id: string): Promise<{ id: string }> {
  return Promise.resolve({ id })
}

describe('student profile SEO page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns noindex metadata when the student does not exist', async () => {
    getStudentForSeoMock.mockResolvedValue(null)

    await expect(
      generateMetadata({ params: makeParams('missing-student') }),
    ).resolves.toEqual({
      title: 'Student not found',
      robots: { index: false, follow: true },
    })

    expect(getStudentForSeoMock).toHaveBeenCalledWith('missing-student')
  })

  it('builds canonical profile metadata with a trimmed summary and image card', async () => {
    getStudentForSeoMock.mockResolvedValue(
      makeStudentSeoRow({ summary: 'A'.repeat(200) }),
    )

    const metadata = await generateMetadata({ params: makeParams('student-1') })

    expect(metadata).toMatchObject({
      title: 'Ada Lovelace | Students',
      description: `${'A'.repeat(157)}\u2026`,
      alternates: { canonical: 'https://mentor.test/students/student-1' },
      openGraph: {
        title: 'Ada Lovelace | Students',
        url: 'https://mentor.test/students/student-1',
        type: 'profile',
        images: [
          {
            url: 'https://img.example.test/ada.png',
            width: 512,
            height: 512,
            alt: 'Ada Lovelace',
          },
        ],
      },
      twitter: { card: 'summary_large_image' },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
      },
    })
  })

  it('uses role and company in metadata when the summary is blank', async () => {
    getStudentForSeoMock.mockResolvedValue(
      makeStudentSeoRow({ summary: '   ', role: 'Engineer', company: 'Acme' }),
    )

    const metadata = await generateMetadata({ params: makeParams('student-1') })

    expect(metadata.description).toBe(
      'Ada Lovelace \u2014 Engineer at Acme. Part of the MentorBridge rural tech community.',
    )
  })

  it('renders student JSON-LD only when SEO data exists', async () => {
    getStudentForSeoMock.mockResolvedValue(makeStudentSeoRow())

    render(await StudentDetailPage({ params: makeParams('student-1') }))

    expect(screen.getByTestId('person-json-ld')).toHaveAttribute(
      'data-student-id',
      'student-1',
    )
    expect(screen.getByTestId('student-page-client')).toHaveTextContent(
      'Student profile student-1',
    )
  })
})
