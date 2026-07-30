import { beforeEach, describe, expect, it, vi } from 'vitest'

import sitemap, { revalidate } from './sitemap'

const { listStudentProfileIdsMock } = vi.hoisted(() => ({
  listStudentProfileIdsMock: vi.fn(),
}))

vi.mock('@/lib/seo/listStudentProfileIds', () => ({
  listStudentProfileIds: listStudentProfileIdsMock,
}))

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('refreshes daily so new student profiles can be indexed', () => {
    expect(revalidate).toBe(86400)
  })

  it('includes dynamic student profile URLs alongside important static pages', async () => {
    listStudentProfileIdsMock.mockResolvedValue(['student-2', 'student-1'])

    const entries = await sitemap()

    expect(listStudentProfileIdsMock).toHaveBeenCalledOnce()
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: 'https://www.mentorbridge.in/mentors',
          changeFrequency: 'monthly',
          priority: 0.8,
        }),
        expect.objectContaining({
          url: 'https://www.mentorbridge.in/students/student-2',
          changeFrequency: 'weekly',
          priority: 0.7,
          lastModified: expect.any(Date),
        }),
        expect.objectContaining({
          url: 'https://www.mentorbridge.in/students/student-1',
          changeFrequency: 'weekly',
          priority: 0.7,
          lastModified: expect.any(Date),
        }),
      ]),
    )
  })
})
