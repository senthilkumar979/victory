import { describe, expect, it, vi } from 'vitest'

import type { StudentSeoRow } from '@/lib/seo/getStudentForSeo'

const { getStudentForSeoMock } = vi.hoisted(() => ({
  getStudentForSeoMock: vi.fn(),
}))

vi.mock('@/lib/seo/getStudentForSeo', () => ({
  getStudentForSeo: getStudentForSeoMock,
}))

vi.mock('./StudentDetailPageClient', () => ({
  StudentDetailPageClient: () => null,
}))

import { generateMetadata } from './page'

function makeStudent(overrides: Partial<StudentSeoRow> = {}): StudentSeoRow {
  return {
    id: 'student-1',
    name: 'Ada Lovelace',
    summary: null,
    picture: null,
    role: null,
    company: null,
    batch: null,
    ...overrides,
  }
}

function params(id = 'student-1') {
  return { params: Promise.resolve({ id }) }
}

describe('student profile metadata', () => {
  it('marks missing student profiles as noindex', async () => {
    getStudentForSeoMock.mockResolvedValueOnce(null)

    const metadata = await generateMetadata(params('missing-student'))

    expect(getStudentForSeoMock).toHaveBeenCalledWith('missing-student')
    expect(metadata).toEqual({
      title: 'Student not found',
      robots: { index: false, follow: true },
    })
  })

  it('builds indexable metadata with a canonical profile URL', async () => {
    getStudentForSeoMock.mockResolvedValueOnce(
      makeStudent({
        role: 'Frontend Engineer',
        company: 'Analytical Engines',
      }),
    )

    const metadata = await generateMetadata(params())

    expect(metadata.title).toBe('Ada Lovelace | Students')
    expect(metadata.description).toBe(
      'Ada Lovelace \u2014 Frontend Engineer at Analytical Engines. Part of the MentorBridge rural tech community.',
    )
    expect(metadata.alternates).toEqual({
      canonical: 'https://www.mentorbridge.in/students/student-1',
    })
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        title: 'Ada Lovelace | Students',
        url: 'https://www.mentorbridge.in/students/student-1',
        type: 'profile',
      }),
    )
    expect(metadata.twitter).toEqual(
      expect.objectContaining({ card: 'summary' }),
    )
    expect(metadata.robots).toEqual({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    })
  })

  it('trims and truncates long summaries before sharing metadata', async () => {
    getStudentForSeoMock.mockResolvedValueOnce(
      makeStudent({
        summary: `  ${'MentorBridge student growth story. '.repeat(8)}  `,
        picture: 'https://images.example.com/ada.png',
      }),
    )

    const metadata = await generateMetadata(params())

    expect(metadata.description).toHaveLength(158)
    expect(metadata.description).toMatch(/MentorBridge student/)
    expect(metadata.description).toMatch(/\u2026$/)
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        images: [
          {
            url: 'https://images.example.com/ada.png',
            width: 512,
            height: 512,
            alt: 'Ada Lovelace',
          },
        ],
      }),
    )
    expect(metadata.twitter).toEqual(
      expect.objectContaining({ card: 'summary_large_image' }),
    )
  })
})
