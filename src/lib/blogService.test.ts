import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return { from: fromMock }
  },
}))

import {
  getAuthors,
  getBlogs,
  getBlogsByStudent,
  getBlogsHero,
  getBlogsRemaining,
} from './blogService'

function listChain(result: {
  data: unknown[] | null
  error: { message: string } | null
  count?: number | null
}) {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    range: vi.fn(),
    limit: vi.fn(),
  }
  chain.select.mockReturnValue(chain)
  chain.order.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.range.mockResolvedValue(result)
  chain.limit.mockResolvedValue(result)
  fromMock.mockReturnValue(chain)
  return chain
}

describe('blogService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('pages blogs by 20 and applies an author filter', async () => {
    const chain = listChain({
      data: [{ id: '1', title: 'Post', link: 'https://example.com' }],
      error: null,
      count: 41,
    })

    const page2 = await getBlogs({ page: 2, authorName: 'Ada' })

    expect(chain.eq).toHaveBeenCalledWith('author_name', 'Ada')
    expect(chain.range).toHaveBeenCalledWith(20, 39)
    expect(page2.totalCount).toBe(41)
    expect(page2.totalPages).toBe(3)
    expect(page2.data).toHaveLength(1)
  })

  it('treats a missing count as zero pages of at least one', async () => {
    listChain({ data: null, error: null, count: null })

    const result = await getBlogs({ page: 1 })

    expect(result.data).toEqual([])
    expect(result.totalCount).toBe(0)
    expect(result.totalPages).toBe(1)
  })

  it('fetches the hero window and remaining blogs after the first 10', async () => {
    const heroChain = listChain({
      data: [{ id: 'h', title: 'Hero', link: 'https://example.com' }],
      error: null,
      count: 35,
    })
    const hero = await getBlogsHero()
    expect(heroChain.range).toHaveBeenCalledWith(0, 9)
    expect(hero.totalCount).toBe(35)

    const remainingChain = listChain({
      data: [{ id: 'r', title: 'Rest', link: 'https://example.com' }],
      error: null,
      count: 35,
    })
    const remaining = await getBlogsRemaining({ page: 2, authorName: 'Ada' })
    expect(remainingChain.eq).toHaveBeenCalledWith('author_name', 'Ada')
    expect(remainingChain.range).toHaveBeenCalledWith(30, 49)
    expect(remaining.totalRemaining).toBe(25)
    expect(remaining.totalRemainingPages).toBe(2)
  })

  it('looks up student blogs by author name first, then username', async () => {
    expect(await getBlogsByStudent()).toEqual([])
    expect(fromMock).not.toHaveBeenCalled()

    listChain({
      data: [{ id: 'by-name', title: 'Named', link: 'https://example.com' }],
      error: null,
    })
    await expect(getBlogsByStudent('ada', 'Ada Lovelace')).resolves.toEqual([
      { id: 'by-name', title: 'Named', link: 'https://example.com' },
    ])

    const usernameChain = listChain({ data: [], error: null })
    usernameChain.eq.mockImplementation((column: string) => {
      if (column === 'username') {
        usernameChain.limit.mockResolvedValue({
          data: [{ id: 'by-user', title: 'User', link: 'https://example.com' }],
          error: null,
        })
      }
      return usernameChain
    })

    await expect(getBlogsByStudent('ada', 'Missing Author')).resolves.toEqual([
      { id: 'by-user', title: 'User', link: 'https://example.com' },
    ])
    expect(usernameChain.eq).toHaveBeenCalledWith('author_name', 'Missing Author')
    expect(usernameChain.eq).toHaveBeenCalledWith('username', 'ada')
  })

  it('returns unique sorted author names and ignores blanks', async () => {
    listChain({
      data: [
        { author_name: 'Zoe' },
        { author_name: 'Ada' },
        { author_name: 'Ada' },
        { author_name: '' },
        { author_name: null },
      ],
      error: null,
    })

    await expect(getAuthors()).resolves.toEqual(['Ada', 'Zoe'])
  })

  it('throws when a list query returns an error', async () => {
    listChain({ data: null, error: { message: 'timeout' }, count: 0 })

    await expect(getBlogs({ page: 1 })).rejects.toEqual({ message: 'timeout' })
  })
})
