import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import sitemap, { revalidate } from '@/app/sitemap'
import { listStudentProfileIds } from '@/lib/seo/listStudentProfileIds'

vi.mock('@/lib/siteUrl', () => ({
  SITE_URL: 'https://www.example.test',
}))

vi.mock('@/lib/seo/listStudentProfileIds', () => ({
  listStudentProfileIds: vi.fn(),
}))

const listStudentProfileIdsMock = vi.mocked(listStudentProfileIds)
const fixedNow = new Date('2026-06-26T23:30:00.000Z')

describe('sitemap', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedNow)
    listStudentProfileIdsMock.mockResolvedValue(['student-1', 'student-2'])
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('revalidates daily so new public student profiles can reach search', () => {
    expect(revalidate).toBe(86400)
  })

  it('includes dynamic student profile URLs with weekly freshness metadata', async () => {
    const entries = await sitemap()

    expect(listStudentProfileIdsMock).toHaveBeenCalledTimes(1)
    expect(entries).toEqual(
      expect.arrayContaining([
        {
          url: 'https://www.example.test/students/student-1',
          lastModified: fixedNow,
          changeFrequency: 'weekly',
          priority: 0.7,
        },
        {
          url: 'https://www.example.test/students/student-2',
          lastModified: fixedNow,
          changeFrequency: 'weekly',
          priority: 0.7,
        },
      ]),
    )
  })

  it('keeps canonical static URLs on the configured public origin', async () => {
    const entries = await sitemap()

    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          url: 'https://www.example.test',
          priority: 1,
        }),
        expect.objectContaining({
          url: 'https://www.example.test/mentors',
          changeFrequency: 'monthly',
        }),
      ]),
    )
  })
})
