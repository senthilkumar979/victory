import { beforeEach, describe, expect, it, vi } from 'vitest'

const { currentUserMock, fromMock } = vi.hoisted(() => ({
  currentUserMock: vi.fn(),
  fromMock: vi.fn(),
}))

vi.mock('@clerk/nextjs/server', () => ({
  currentUser: currentUserMock,
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

import { GET } from './route'

const DEFAULT_ORIGIN = 'https://mentorbridge.in'

interface EmailAddress {
  id: string
  emailAddress: string
}

function makeUser({
  emails = [{ id: 'primary', emailAddress: 'ada@example.com' }],
  primaryId,
  publicMetadata = {},
}: {
  emails?: EmailAddress[]
  primaryId?: string | null
  publicMetadata?: Record<string, unknown>
} = {}) {
  return {
    id: 'user_1',
    primaryEmailAddressId:
      primaryId === undefined ? (emails[0]?.id ?? null) : primaryId,
    emailAddresses: emails,
    publicMetadata,
  }
}

function mockStudentLookup(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result)
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  fromMock.mockReturnValue({ select })
  return { select, eq }
}

async function redirectLocation(response: Response) {
  expect(response.status).toBe(307)
  return response.headers.get('location')
}

describe('GET /post-login', () => {
  beforeEach(() => {
    currentUserMock.mockReset()
    fromMock.mockReset()
    delete process.env.NEXT_PUBLIC_APP_URL
  })

  it('sends signed-out visitors to sign-in on the configured origin', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3001'
    currentUserMock.mockResolvedValue(null)

    const location = await redirectLocation(await GET())

    expect(location).toBe('http://localhost:3001/sign-in')
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('defaults the origin when the app URL is unset', async () => {
    currentUserMock.mockResolvedValue(null)

    expect(await redirectLocation(await GET())).toBe(`${DEFAULT_ORIGIN}/sign-in`)
  })

  it('sends a user with no usable email to the profile page', async () => {
    currentUserMock.mockResolvedValue(makeUser({ emails: [] }))
    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/profile`,
    )

    currentUserMock.mockResolvedValue(
      makeUser({ emails: [{ id: 'e1', emailAddress: '' }], primaryId: 'e1' }),
    )
    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/profile`,
    )
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('queries the primary email and falls back to the first address', async () => {
    currentUserMock.mockResolvedValue(
      makeUser({
        emails: [
          { id: 'e1', emailAddress: 'first@example.com' },
          { id: 'e2', emailAddress: 'ada@example.com' },
        ],
        primaryId: 'e2',
      }),
    )
    const primaryQuery = mockStudentLookup({
      data: { id: 's1', name: 'Ada', role: 'Dev', batch: '2025' },
      error: null,
    })

    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/dashboard`,
    )
    expect(primaryQuery.select).toHaveBeenCalledWith('id, name, role, batch')
    expect(primaryQuery.eq).toHaveBeenCalledWith('email', 'ada@example.com')

    currentUserMock.mockResolvedValue(
      makeUser({
        emails: [
          { id: 'e1', emailAddress: 'first@example.com' },
          { id: 'e2', emailAddress: 'ada@example.com' },
        ],
        primaryId: 'missing',
      }),
    )
    const fallbackQuery = mockStudentLookup({
      data: { id: 's1', name: 'Ada', role: 'Dev', batch: '2025' },
      error: null,
    })

    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/dashboard`,
    )
    expect(fallbackQuery.eq).toHaveBeenCalledWith('email', 'first@example.com')
  })

  it('sends shared-helper admins to admin before loading a student row', async () => {
    currentUserMock.mockResolvedValue(
      makeUser({ publicMetadata: { isAdmin: true } }),
    )
    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/admin`,
    )

    currentUserMock.mockResolvedValue(
      makeUser({ publicMetadata: { role: ' Admin ' } }),
    )
    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/admin`,
    )
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('does not treat the string false as an admin', async () => {
    currentUserMock.mockResolvedValue(
      makeUser({ publicMetadata: { isAdmin: 'false', role: 'student' } }),
    )
    mockStudentLookup({ data: null, error: null })

    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/profile`,
    )
    expect(fromMock).toHaveBeenCalledWith('students')
  })

  it('sends database errors and missing students to the profile page', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    currentUserMock.mockResolvedValue(makeUser())
    mockStudentLookup({ data: null, error: { message: 'down' } })

    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/profile`,
    )
    expect(errorSpy).toHaveBeenCalledWith(
      'Error loading student for post-login:',
      { message: 'down' },
    )

    errorSpy.mockClear()
    mockStudentLookup({ data: null, error: null })
    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/profile`,
    )
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('keeps a whitespace-only profile on the profile page', async () => {
    currentUserMock.mockResolvedValue(makeUser())
    mockStudentLookup({
      data: { id: 's1', name: '   ', role: 'Dev', batch: '2025' },
      error: null,
    })

    expect(await redirectLocation(await GET())).toBe(
      `${DEFAULT_ORIGIN}/secured/profile`,
    )
  })
})
