import type { StudentSeoRow } from '@/lib/seo/getStudentForSeo'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getStudentForSeoMock } = vi.hoisted(() => ({
  getStudentForSeoMock: vi.fn(),
}))

vi.mock('@/components/seo/PersonJsonLd', () => ({
  PersonJsonLd: () => null,
}))
vi.mock('@/lib/seo/getStudentForSeo', () => ({
  getStudentForSeo: getStudentForSeoMock,
}))
vi.mock('./StudentDetailPageClient', () => ({
  StudentDetailPageClient: () => null,
}))

import { generateMetadata } from './page'

const baseStudent: StudentSeoRow = {
  id: 'student-1',
  name: 'Ada Lovelace',
  summary: null,
  picture: null,
  role: null,
  company: null,
  batch: null,
}

function pageParams(id: string) {
  return { params: Promise.resolve({ id }) }
}

describe('student profile metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('marks missing student profiles as noindex', async () => {
    getStudentForSeoMock.mockResolvedValue(null)

    const metadata = await generateMetadata(pageParams('missing-student'))

    expect(getStudentForSeoMock).toHaveBeenCalledWith('missing-student')
    expect(metadata).toMatchObject({
      title: 'Student not found',
      robots: { index: false, follow: true },
    })
  })

  it('builds profile metadata with role, company, canonical, and image data', async () => {
    getStudentForSeoMock.mockResolvedValue({
      ...baseStudent,
      role: 'Frontend Engineer',
      company: 'MentorBridge',
      picture: 'https://cdn.example.com/ada.png',
    })

    const metadata = await generateMetadata(pageParams('student-1'))

    expect(metadata).toMatchObject({
      title: 'Ada Lovelace | Students',
      description:
        'Ada Lovelace \u2014 Frontend Engineer at MentorBridge. Part of the MentorBridge rural tech community.',
      alternates: {
        canonical: 'https://www.mentorbridge.in/students/student-1',
      },
      openGraph: {
        type: 'profile',
        url: 'https://www.mentorbridge.in/students/student-1',
        images: [
          {
            url: 'https://cdn.example.com/ada.png',
            width: 512,
            height: 512,
            alt: 'Ada Lovelace',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
      },
      robots: {
        index: true,
        follow: true,
      },
    })
  })

  it('trims and truncates long student summaries for metadata descriptions', async () => {
    const longSummary = 'A'.repeat(170)
    getStudentForSeoMock.mockResolvedValue({
      ...baseStudent,
      summary: `  ${longSummary}  `,
    })

    const metadata = await generateMetadata(pageParams('student-1'))

    expect(metadata.description).toBe(`${'A'.repeat(157)}\u2026`)
    expect(metadata.twitter).toMatchObject({ card: 'summary' })
    expect(metadata.openGraph).not.toHaveProperty('images')
  })
})
