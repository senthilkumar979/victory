import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import sitemap from './sitemap'

const { listStudentProfileIdsMock } = vi.hoisted(() => ({
  listStudentProfileIdsMock: vi.fn(),
}))

vi.mock('@/lib/seo/listStudentProfileIds', () => ({
  listStudentProfileIds: listStudentProfileIdsMock,
}))

describe('sitemap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-24T00:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('includes public student profile URLs returned by the SEO data source', async () => {
    const lastModified = new Date('2026-06-24T00:00:00.000Z')
    listStudentProfileIdsMock.mockResolvedValue(['ada-lovelace', 'grace-hopper'])

    const entries = await sitemap()

    expect(listStudentProfileIdsMock).toHaveBeenCalledTimes(1)
    expect(entries).toEqual(
      expect.arrayContaining([
        {
          url: 'https://www.mentorbridge.in',
          lastModified,
          changeFrequency: 'weekly',
          priority: 1,
        },
        {
          url: 'https://www.mentorbridge.in/students/ada-lovelace',
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.7,
        },
        {
          url: 'https://www.mentorbridge.in/students/grace-hopper',
          lastModified,
          changeFrequency: 'weekly',
          priority: 0.7,
        },
      ]),
    )
  })
})
