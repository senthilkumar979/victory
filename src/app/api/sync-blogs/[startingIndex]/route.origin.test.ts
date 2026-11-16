import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from './route'

const dbState = vi.hoisted(() => ({
  admin: null as { from: ReturnType<typeof vi.fn> } | null,
  anonFrom: vi.fn(),
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.admin
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: (...args: unknown[]) => dbState.anonFrom(...args),
  },
}))

const ENV_KEYS = ['VERCEL_URL', 'NEXT_PUBLIC_APP_URL'] as const

function installStudentQuery(
  fromMock: ReturnType<typeof vi.fn>,
  rows: { medium_username: string | null }[] | null,
  options?: { totalStudents?: number; error?: { message: string } | null },
) {
  const limit = vi.fn().mockResolvedValue({
    data: rows,
    error: options?.error ?? null,
  })
  const gte = vi.fn(() => ({ limit }))
  const order = vi.fn(() => ({ gte }))
  fromMock.mockReturnValue({
    select: vi.fn((_columns: string, query?: { head?: boolean }) => {
      if (query?.head) {
        return Promise.resolve({
          count: options?.totalStudents ?? rows?.length ?? 0,
        })
      }
      return { order }
    }),
  })
}

function bindAdminClient() {
  const from = vi.fn()
  dbState.admin = { from }
  return from
}

function syncRequest(headers?: HeadersInit) {
  return new NextRequest('http://localhost:3001/api/sync-blogs/61', { headers })
}

function okAddBlogResponse() {
  return new Response(
    JSON.stringify({ data: { added: 0, skipped: 0, errors: [] } }),
    { status: 200, headers: { 'content-type': 'application/json' } },
  )
}

async function postedAddBlogUrl(request: NextRequest): Promise<string> {
  installStudentQuery(bindAdminClient(), [{ medium_username: 'ada' }], {
    totalStudents: 1,
  })
  const fetchMock = vi.fn().mockResolvedValue(okAddBlogResponse())
  vi.stubGlobal('fetch', fetchMock)

  const response = await GET(request, {
    params: Promise.resolve({ startingIndex: '61' }),
  })

  expect(response.status).toBe(200)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  return String(fetchMock.mock.calls[0]?.[0])
}

describe('GET /api/sync-blogs origin and failure edges', () => {
  const savedEnv: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>> =
    {}

  beforeEach(() => {
    dbState.admin = null
    dbState.anonFrom.mockReset()
    for (const key of ENV_KEYS) {
      savedEnv[key] = process.env[key]
      delete process.env[key]
    }
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (savedEnv[key] === undefined) delete process.env[key]
      else process.env[key] = savedEnv[key]
    }
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('posts to the request host and lets x-forwarded-proto win', async () => {
    await expect(
      postedAddBlogUrl(syncRequest({ host: 'www.mentorbridge.in' })),
    ).resolves.toBe('https://www.mentorbridge.in/api/add-blog')

    await expect(
      postedAddBlogUrl(
        syncRequest({
          host: 'www.mentorbridge.in',
          'x-forwarded-proto': 'http',
        }),
      ),
    ).resolves.toBe('http://www.mentorbridge.in/api/add-blog')

    await expect(
      postedAddBlogUrl(
        syncRequest({ host: 'localhost:3001', 'x-forwarded-proto': 'https' }),
      ),
    ).resolves.toBe('https://localhost:3001/api/add-blog')
  })

  it('keeps loopback hosts on http when no forwarded protocol is set', async () => {
    await expect(
      postedAddBlogUrl(syncRequest({ host: '127.0.0.1:3001' })),
    ).resolves.toBe('http://127.0.0.1:3001/api/add-blog')

    await expect(
      postedAddBlogUrl(syncRequest({ host: '[::1]:3001' })),
    ).resolves.toBe('http://[::1]:3001/api/add-blog')
  })

  it('prefers VERCEL_URL over NEXT_PUBLIC_APP_URL when the host header is missing', async () => {
    process.env.VERCEL_URL = 'victory-abc.vercel.app'
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.mentorbridge.in'

    await expect(postedAddBlogUrl(syncRequest())).resolves.toBe(
      'https://victory-abc.vercel.app/api/add-blog',
    )
  })

  it('uses NEXT_PUBLIC_APP_URL only when the host and VERCEL_URL are missing', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.mentorbridge.in'

    await expect(postedAddBlogUrl(syncRequest())).resolves.toBe(
      'https://www.mentorbridge.in/api/add-blog',
    )
  })

  it('falls back to localhost:3000 when no host or app URL is available', async () => {
    await expect(postedAddBlogUrl(syncRequest())).resolves.toBe(
      'http://localhost:3000/api/add-blog',
    )
  })

  it('rejects a non-numeric starting index before querying students', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: 'nope' }),
    })

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      message: 'Invalid startingIndex',
    })
    expect(dbState.anonFrom).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns a generic 500 when the student query fails and does not call add-blog', async () => {
    installStudentQuery(bindAdminClient(), null, {
      totalStudents: 8,
      error: { message: 'relation "students" does not exist' },
    })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '61' }),
    })

    expect(response.status).toBe(500)
    const body = await response.json()
    expect(body.message).toBe('Failed to fetch students')
    expect(JSON.stringify(body)).not.toContain('relation')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('records provider and transport failures per username', async () => {
    installStudentQuery(
      bindAdminClient(),
      [{ medium_username: 'ada' }, { medium_username: 'grace' }],
      { totalStudents: 2 },
    )
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Username required' }), {
          status: 400,
          statusText: 'Bad Request',
          headers: { 'content-type': 'application/json' },
        }),
      )
      .mockResolvedValueOnce(
        new Response('{}', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'content-type': 'application/json' },
        }),
      )
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '12' }),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: {
        results: [
          { username: 'ada', added: 0, skipped: 0, error: 'Username required' },
          {
            username: 'grace',
            added: 0,
            skipped: 0,
            error: 'Service Unavailable',
          },
        ],
      },
    })
  })

  it('keeps an Error message and replaces a thrown non-Error', async () => {
    installStudentQuery(
      bindAdminClient(),
      [{ medium_username: 'ada' }, { medium_username: 'grace' }],
      { totalStudents: 2 },
    )
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockRejectedValueOnce(new Error('network down'))
        .mockRejectedValueOnce('socket hang up'),
    )

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '12' }),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      data: {
        totalAdded: 0,
        results: [
          { username: 'ada', error: 'network down' },
          { username: 'grace', error: 'Unknown error' },
        ],
      },
    })
  })

  it('joins item errors and skips whitespace-only usernames', async () => {
    installStudentQuery(
      bindAdminClient(),
      [{ medium_username: '   ' }, { medium_username: 'ada' }],
      { totalStudents: 2 },
    )
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            data: { added: 1, skipped: 2, errors: ['dup', 'bad date'] },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
      ),
    )

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '12' }),
    })
    const body = await response.json()

    expect(body.data.usernamesProcessed).toBe(1)
    expect(body.data.usernamesSkipped).toBe(1)
    expect(body.data.totalAdded).toBe(1)
    expect(body.data.totalSkipped).toBe(2)
    expect(body.data.results).toEqual([
      { username: 'ada', added: 1, skipped: 2, error: 'dup; bad date' },
    ])
  })

  it('explains an empty admin page without calling add-blog', async () => {
    installStudentQuery(bindAdminClient(), [], { totalStudents: 4 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '61' }),
    })
    const body = await response.json()

    expect(body.success).toBe(true)
    expect(body.message).toContain('No students with serial_no ≥ 61')
    expect(body.message).not.toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('explains an empty anon page when the service role client is missing', async () => {
    installStudentQuery(dbState.anonFrom, [], { totalStudents: 0 })
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '61' }),
    })
    const body = await response.json()

    expect(body.message).toContain('SUPABASE_SERVICE_ROLE_KEY')
    expect(dbState.anonFrom).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(console.warn).toHaveBeenCalled()
  })

  it('hides unexpected failures behind a generic 500', async () => {
    const from = bindAdminClient()
    from.mockImplementation(() => {
      throw new Error('service role leaked')
    })

    const response = await GET(syncRequest({ host: 'localhost:3001' }), {
      params: Promise.resolve({ startingIndex: '61' }),
    })
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      message: 'An unexpected error occurred',
      data: { startingIndex: 0, results: [] },
    })
    expect(JSON.stringify(body)).not.toContain('service role leaked')
  })
})
