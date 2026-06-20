import { beforeEach, describe, expect, it, vi } from 'vitest'

const { listStudentProfileIdsMock } = vi.hoisted(() => ({
  listStudentProfileIdsMock: vi.fn(),
}))

vi.mock('@/lib/seo/listStudentProfileIds', () => ({
  listStudentProfileIds: listStudentProfileIdsMock,
}))

import sitemap from './sitemap'

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listStudentProfileIdsMock.mockResolvedValue(['student-a', 'student-b'])
  })

  it('includes static SEO pages and student profile URLs', async () => {
    const entries = await sitemap()
    const entriesByUrl = new Map(entries.map((entry) => [entry.url, entry]))

    expect(listStudentProfileIdsMock).toHaveBeenCalledTimes(1)
    expect(entriesByUrl.get('https://www.mentorbridge.in/mentors')).toMatchObject({
      changeFrequency: 'monthly',
      priority: 0.8,
    })
    expect(
      entriesByUrl.get('https://www.mentorbridge.in/terms-conditions'),
    ).toMatchObject({
      changeFrequency: 'yearly',
      priority: 0.4,
    })
    expect(entriesByUrl.get('https://www.mentorbridge.in/students/student-a')).toMatchObject({
      changeFrequency: 'weekly',
      priority: 0.7,
    })
    expect(entriesByUrl.get('https://www.mentorbridge.in/students/student-b')).toMatchObject({
      changeFrequency: 'weekly',
      priority: 0.7,
    })
    expect(entriesByUrl.has('https://www.mentorbridge.in/terms-and-conditions')).toBe(
      false,
    )
  })

  it('uses one deterministic lastModified value for each generated entry', async () => {
    const entries = await sitemap()
    const firstLastModified = entries[0].lastModified

    expect(firstLastModified).toBeInstanceOf(Date)
    expect(entries.every((entry) => entry.lastModified === firstLastModified)).toBe(
      true,
    )
  })
})
