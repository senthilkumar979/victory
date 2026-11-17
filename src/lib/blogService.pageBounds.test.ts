import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return { from: fromMock }
  },
}))

import { getBlogs, getBlogsRemaining } from './blogService'

function listChain(count: number) {
  const chain = {
    select: vi.fn(),
    order: vi.fn(),
    eq: vi.fn(),
    range: vi.fn(),
    limit: vi.fn(),
  }
  const result = { data: [], error: null, count }
  chain.select.mockReturnValue(chain)
  chain.order.mockReturnValue(chain)
  chain.eq.mockReturnValue(chain)
  chain.range.mockResolvedValue(result)
  chain.limit.mockResolvedValue(result)
  fromMock.mockReturnValue(chain)
  return chain
}

describe('blog catalog page boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not add a blank page when a catalog fills the page size exactly', async () => {
    const fullPage = listChain(20)
    const firstPage = await getBlogs({ page: 1 })

    expect(fullPage.range).toHaveBeenCalledWith(0, 19)
    expect(firstPage.totalCount).toBe(20)
    expect(firstPage.totalPages).toBe(1)

    const twoFullPages = listChain(40)
    const secondPage = await getBlogs({ page: 2 })

    expect(twoFullPages.range).toHaveBeenCalledWith(20, 39)
    expect(secondPage.totalPages).toBe(2)

    listChain(21)
    await expect(getBlogs({ page: 1 })).resolves.toMatchObject({
      totalCount: 21,
      totalPages: 2,
    })
  })

  it('counts pages after the 10-item hero on exact remaining-page boundaries', async () => {
    const exactHeroPlusOnePage = listChain(30)

    await expect(getBlogsRemaining({ page: 1 })).resolves.toEqual({
      data: [],
      totalCount: 30,
      totalRemaining: 20,
      totalRemainingPages: 1,
    })
    expect(exactHeroPlusOnePage.range).toHaveBeenCalledWith(10, 29)

    listChain(31)
    await expect(getBlogsRemaining({ page: 1 })).resolves.toMatchObject({
      totalRemaining: 21,
      totalRemainingPages: 2,
    })

    const twoRemainingPages = listChain(50)
    await expect(getBlogsRemaining({ page: 2 })).resolves.toMatchObject({
      totalRemaining: 40,
      totalRemainingPages: 2,
    })
    expect(twoRemainingPages.range).toHaveBeenCalledWith(30, 49)

    const thirdPage = listChain(51)
    await expect(getBlogsRemaining({ page: 3 })).resolves.toMatchObject({
      totalRemaining: 41,
      totalRemainingPages: 3,
    })
    expect(thirdPage.range).toHaveBeenCalledWith(50, 69)
  })
})
