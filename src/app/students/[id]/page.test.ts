import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getStudentForSeoMock } = vi.hoisted(() => ({
  getStudentForSeoMock: vi.fn(),
}))

vi.mock('@/lib/seo/getStudentForSeo', () => ({
  getStudentForSeo: getStudentForSeoMock,
}))

vi.mock('@/components/seo/PersonJsonLd', () => ({
  PersonJsonLd: () => null,
}))

vi.mock('./StudentDetailPageClient', () => ({
  StudentDetailPageClient: () => null,
}))

import { generateMetadata } from './page'

interface StudentSeoFixture {
  id: string
  name: string
  summary: string | null
  picture: string | null
  role: string | null
  company: string | null
  batch: string | null
}

function makeStudentSeoRow(
  overrides: Partial<StudentSeoFixture> = {},
): StudentSeoFixture {
  return {
    id: 'student-1',
    name: 'Ada Lovelace',
    summary: 'Builds thoughtful TypeScript learning paths.',
    picture: 'https://example.com/ada.png',
    role: 'Engineer',
    company: 'MentorBridge Labs',
    batch: '2026',
    ...overrides,
  }
}

describe('student profile metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks missing students as noindex instead of publishing broken profiles', async () => {
    getStudentForSeoMock.mockResolvedValue(null)

    await expect(
      generateMetadata({ params: Promise.resolve({ id: 'missing-student' }) }),
    ).resolves.toEqual({
      title: 'Student not found',
      robots: { index: false, follow: true },
    })

    expect(getStudentForSeoMock).toHaveBeenCalledWith('missing-student')
  })

  it('builds canonical social metadata from a real student profile', async () => {
    getStudentForSeoMock.mockResolvedValue(makeStudentSeoRow())

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'student-1' }),
    })

    expect(metadata).toEqual(
      expect.objectContaining({
        title: 'Ada Lovelace | Students',
        description: 'Builds thoughtful TypeScript learning paths.',
        alternates: {
          canonical: 'https://www.mentorbridge.in/students/student-1',
        },
        robots: {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true },
        },
      }),
    )
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        url: 'https://www.mentorbridge.in/students/student-1',
        type: 'profile',
        images: [
          {
            url: 'https://example.com/ada.png',
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

  it('trims and caps long summaries before exposing metadata descriptions', async () => {
    getStudentForSeoMock.mockResolvedValue(
      makeStudentSeoRow({ summary: `  ${'a'.repeat(170)}  ` }),
    )

    const metadata = await generateMetadata({
      params: Promise.resolve({ id: 'student-1' }),
    })

    expect(metadata.description).toHaveLength(158)
    expect(metadata.description).toMatch(new RegExp(`^${'a'.repeat(157)}`))
    expect(metadata.description).toMatch(/\u2026$/)
  })
})
