import { beforeEach, describe, expect, it, vi } from 'vitest'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => fromMock(...args),
  },
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/add-blog', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never
}

function mockSupabase(options: {
  existingLinks?: string[]
  insertError?: { code?: string; message: string } | null
}) {
  const inMock = vi.fn().mockResolvedValue({
    data: (options.existingLinks ?? []).map((link) => ({ link })),
  })
  const selectMock = vi.fn().mockReturnValue({ in: inMock })
  const insertMock = vi.fn().mockResolvedValue({
    error: options.insertError ?? null,
  })
  fromMock.mockReturnValue({
    select: selectMock,
    insert: insertMock,
  })
  return { selectMock, inMock, insertMock }
}

function rssOk(items: Array<{
  title?: string
  author?: string
  pubDate: string
  description: string
  link: string
}>) {
  return {
    ok: true,
    json: async () => ({
      status: 'ok',
      feed: { title: 'feed', description: '', link: '' },
      items,
    }),
  }
}

describe('POST /api/add-blog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn())
  })

  it('rejects missing, non-string, and whitespace-only usernames', async () => {
    const missing = await POST(makeRequest({}))
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toMatchObject({
      success: false,
      message: 'Username is required',
    })

    const empty = await POST(makeRequest({ username: '   ' }))
    expect(empty.status).toBe(400)
    await expect(empty.json()).resolves.toMatchObject({
      success: false,
      message: 'Username cannot be empty',
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('strips a leading @ and fetches the Medium RSS via rss2json', async () => {
    vi.mocked(fetch).mockResolvedValue(rssOk([]) as never)

    await POST(makeRequest({ username: ' @alice ' }))

    expect(fetch).toHaveBeenCalledTimes(1)
    const url = String(vi.mocked(fetch).mock.calls[0][0])
    expect(url).toContain('https://api.rss2json.com/v1/api.json?rss_url=')
    expect(url).toContain(encodeURIComponent('https://medium.com/feed/@alice'))
  })

  it('returns 400 when the RSS feed cannot be processed or has no items', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'error', items: [] }),
    } as never)
    const badStatus = await POST(makeRequest({ username: 'alice' }))
    expect(badStatus.status).toBe(400)
    await expect(badStatus.json()).resolves.toMatchObject({
      data: { errors: ['RSS feed could not be processed'] },
    })

    vi.mocked(fetch).mockResolvedValue(rssOk([]) as never)
    const empty = await POST(makeRequest({ username: 'alice' }))
    expect(empty.status).toBe(400)
    await expect(empty.json()).resolves.toMatchObject({
      data: { errors: ['No items in feed'] },
    })
  })

  it('skips existing links, extracts the first cover image, and inserts new rows', async () => {
    vi.mocked(fetch).mockResolvedValue(
      rssOk([
        {
          title: 'Kept',
          author: 'Ada',
          pubDate: '2026-01-15T10:00:00Z',
          description: '<p><img src="https://cdn.example/cover.webp" alt=""></p>',
          link: 'https://medium.com/@alice/kept',
        },
        {
          title: 'Duplicate',
          author: 'Ada',
          pubDate: '2026-01-16T10:00:00Z',
          description: 'no image',
          link: 'https://medium.com/@alice/dup',
        },
      ]) as never,
    )
    const { insertMock, inMock } = mockSupabase({
      existingLinks: ['https://medium.com/@alice/dup'],
    })

    const response = await POST(makeRequest({ username: 'alice' }))
    const body = await response.json()

    expect(inMock).toHaveBeenCalledWith('link', [
      'https://medium.com/@alice/kept',
      'https://medium.com/@alice/dup',
    ])
    expect(insertMock).toHaveBeenCalledWith([
      expect.objectContaining({
        title: 'Kept',
        author_name: 'Ada',
        cover_image_url: 'https://cdn.example/cover.webp',
        link: 'https://medium.com/@alice/kept',
        username: 'alice',
        published_date: new Date('2026-01-15T10:00:00Z').toISOString(),
      }),
    ])
    expect(response.status).toBe(200)
    expect(body).toMatchObject({
      success: true,
      data: { added: 1, skipped: 1, errors: [], total: 2 },
    })
  })

  it('maps unique-constraint races and other insert failures without throwing', async () => {
    vi.mocked(fetch).mockResolvedValue(
      rssOk([
        {
          title: 'New',
          author: 'Ada',
          pubDate: '2026-01-15T10:00:00Z',
          description: '',
          link: 'https://medium.com/@alice/new',
        },
      ]) as never,
    )
    mockSupabase({ insertError: { code: '23505', message: 'duplicate' } })
    const raced = await POST(makeRequest({ username: 'alice' }))
    expect(raced.status).toBe(200)
    await expect(raced.json()).resolves.toMatchObject({
      data: {
        added: 0,
        errors: [
          'One or more links already exist (race condition); no rows inserted.',
        ],
      },
    })

    mockSupabase({ insertError: { message: 'disk full' } })
    const failed = await POST(makeRequest({ username: 'alice' }))
    expect(failed.status).toBe(200)
    await expect(failed.json()).resolves.toMatchObject({
      data: { errors: ['Insert failed: disk full'] },
    })
  })

  it('maps RSS HTTP failures to 500 with the error message', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      statusText: 'Bad Gateway',
    } as never)

    const response = await POST(makeRequest({ username: 'alice' }))

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      data: { errors: ['Failed to fetch RSS feed: Bad Gateway'] },
    })
  })
})
