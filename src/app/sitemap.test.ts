import { beforeEach, describe, expect, it, vi } from 'vitest'

const { listStudentProfileIdsMock } = vi.hoisted(() => ({
  listStudentProfileIdsMock: vi.fn(),
}))

vi.mock('@/data/roadmaps', () => ({
  ROADMAP_SLUGS: ['frontend-roadmap'],
}))

vi.mock('@/data/interview-prep', () => ({
  INTERVIEW_TRACK_SLUGS: ['react-interview'],
}))

vi.mock('@/lib/siteUrl', () => ({
  SITE_URL: 'https://mentor.test',
}))

vi.mock('@/lib/seo/listStudentProfileIds', () => ({
  listStudentProfileIds: listStudentProfileIdsMock,
}))

import sitemap from './sitemap'

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes static, learning, and student profile URLs with SEO priorities', async () => {
    listStudentProfileIdsMock.mockResolvedValue(['student-1', 'student-2'])

    const entries = await sitemap()

    expect(listStudentProfileIdsMock).toHaveBeenCalledTimes(1)
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: 'https://mentor.test',
          changeFrequency: 'weekly',
          priority: 1,
        }),
        expect.objectContaining({
          url: 'https://mentor.test/mentors',
          changeFrequency: 'monthly',
          priority: 0.8,
        }),
        expect.objectContaining({
          url: 'https://mentor.test/roadmaps/frontend-roadmap',
          changeFrequency: 'monthly',
          priority: 0.75,
        }),
        expect.objectContaining({
          url: 'https://mentor.test/interview-prep/react-interview',
          changeFrequency: 'monthly',
          priority: 0.75,
        }),
        expect.objectContaining({
          url: 'https://mentor.test/students/student-1',
          changeFrequency: 'weekly',
          priority: 0.7,
        }),
        expect.objectContaining({
          url: 'https://mentor.test/students/student-2',
          changeFrequency: 'weekly',
          priority: 0.7,
        }),
      ]),
    )
  })

  it('still emits core static URLs when student profile lookup is empty', async () => {
    listStudentProfileIdsMock.mockResolvedValue([])

    const entries = await sitemap()

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: 'https://mentor.test/students' }),
        expect.objectContaining({ url: 'https://mentor.test/blogs' }),
      ]),
    )
    expect(entries.some((entry) => entry.url.includes('/students/student-'))).toBe(
      false,
    )
  })
})
