import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return { from: fromMock }
  },
}))

import { getBlogsByStudent, getBlogsRemaining } from './blogService'

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

describe('blogService student lookup and remaining window', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses the Medium username when the author lookup fails', async () => {
    const chain = listChain({
      data: null,
      error: { message: 'author column missing' },
    })
    chain.limit
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'author column missing' },
      })
      .mockResolvedValueOnce({
        data: [{ id: 'by-user', title: 'User', link: 'https://example.com' }],
        error: null,
      })

    await expect(getBlogsByStudent('ada', 'Ada Lovelace')).resolves.toEqual([
      { id: 'by-user', title: 'User', link: 'https://example.com' },
    ])
    expect(chain.eq).toHaveBeenNthCalledWith(1, 'author_name', 'Ada Lovelace')
    expect(chain.eq).toHaveBeenNthCalledWith(2, 'username', 'ada')
  })

  it('returns no blogs when the username lookup also fails', async () => {
    listChain({ data: null, error: { message: 'username down' } })

    await expect(getBlogsByStudent('ada', 'Ada Lovelace')).resolves.toEqual([])
  })

  it('queries only the username when no author name is provided', async () => {
    const chain = listChain({
      data: [{ id: 'by-user', title: 'User', link: 'https://example.com' }],
      error: null,
    })

    await expect(getBlogsByStudent('ada', null)).resolves.toEqual([
      { id: 'by-user', title: 'User', link: 'https://example.com' },
    ])
    expect(chain.eq).toHaveBeenCalledTimes(1)
    expect(chain.eq).toHaveBeenCalledWith('username', 'ada')
  })

  it('keeps one remaining page when the catalog is smaller than the hero', async () => {
    const chain = listChain({ data: [], error: null, count: 4 })

    const remaining = await getBlogsRemaining({
      page: 1,
      authorName: 'Ada Lovelace',
    })

    expect(chain.eq).toHaveBeenCalledWith('author_name', 'Ada Lovelace')
    expect(chain.range).toHaveBeenCalledWith(10, 29)
    expect(remaining).toEqual({
      data: [],
      totalCount: 4,
      totalRemaining: 0,
      totalRemainingPages: 1,
    })
  })

  it('treats a missing remaining count as an empty first page', async () => {
    const chain = listChain({ data: null, error: null, count: null })

    const remaining = await getBlogsRemaining({ page: 2 })

    expect(chain.eq).not.toHaveBeenCalled()
    expect(chain.range).toHaveBeenCalledWith(30, 49)
    expect(remaining).toEqual({
      data: [],
      totalCount: 0,
      totalRemaining: 0,
      totalRemainingPages: 1,
    })
  })
})
