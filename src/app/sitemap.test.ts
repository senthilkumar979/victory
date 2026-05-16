import { beforeEach, describe, expect, it, vi } from 'vitest'

import { INTERVIEW_TRACK_SLUGS } from '@/data/interview-prep'
import { ROADMAP_SLUGS } from '@/data/roadmaps'

const { listStudentProfileIdsMock } = vi.hoisted(() => ({
  listStudentProfileIdsMock: vi.fn(),
}))

vi.mock('@/lib/seo/listStudentProfileIds', () => ({
  listStudentProfileIds: listStudentProfileIdsMock,
}))

import sitemap, { revalidate } from './sitemap'

const siteUrl = 'https://www.mentorbridge.in'

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listStudentProfileIdsMock.mockResolvedValue(['student-2', 'student-1'])
  })

  it('refreshes daily so newly published student pages can be discovered', () => {
    expect(revalidate).toBe(86400)
  })

  it('includes static, roadmap, interview prep, and dynamic student URLs', async () => {
    const entries = await sitemap()

    expect(listStudentProfileIdsMock).toHaveBeenCalledTimes(1)
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: siteUrl,
          changeFrequency: 'weekly',
          priority: 1,
        }),
        expect.objectContaining({
          url: `${siteUrl}/mentors`,
          changeFrequency: 'monthly',
          priority: 0.8,
        }),
        expect.objectContaining({
          url: `${siteUrl}/roadmaps/${ROADMAP_SLUGS[0]}`,
          changeFrequency: 'monthly',
          priority: 0.75,
        }),
        expect.objectContaining({
          url: `${siteUrl}/interview-prep/${INTERVIEW_TRACK_SLUGS[0]}`,
          changeFrequency: 'monthly',
          priority: 0.75,
        }),
        expect.objectContaining({
          url: `${siteUrl}/students/student-2`,
          changeFrequency: 'weekly',
          priority: 0.7,
        }),
      ]),
    )
    expect(
      entries
        .map((entry) => entry.url)
        .filter((url) => url.startsWith(`${siteUrl}/students/`)),
    ).toEqual([`${siteUrl}/students/student-2`, `${siteUrl}/students/student-1`])
  })
})
