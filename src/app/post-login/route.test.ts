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

interface MockEmailAddress {
  id: string
  emailAddress: string
}

interface MockClerkUser {
  primaryEmailAddressId: string | null
  emailAddresses: MockEmailAddress[]
  publicMetadata: {
    role?: string
  }
}

interface StudentQuery {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  maybeSingle: ReturnType<typeof vi.fn>
}

function makeUser(overrides: Partial<MockClerkUser> = {}): MockClerkUser {
  return {
    primaryEmailAddressId: 'email-1',
    emailAddresses: [
      { id: 'email-1', emailAddress: 'member@example.com' },
      { id: 'email-2', emailAddress: 'backup@example.com' },
    ],
    publicMetadata: {},
    ...overrides,
  }
}

function mockStudentLookup(result: unknown): StudentQuery {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  fromMock.mockReturnValue(query)
  return query
}

async function getRedirect() {
  const response = await GET()
  return {
    location: response.headers.get('location'),
    status: response.status,
  }
}

describe('GET /post-login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'
  })

  it('redirects signed-out visitors to sign in without querying students', async () => {
    currentUserMock.mockResolvedValue(null)

    await expect(getRedirect()).resolves.toEqual({
      location: 'https://app.example.com/sign-in',
      status: 307,
    })
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('routes admins to the admin area without requiring a student row', async () => {
    currentUserMock.mockResolvedValue(
      makeUser({ publicMetadata: { role: 'admin' } }),
    )

    await expect(getRedirect()).resolves.toEqual({
      location: 'https://app.example.com/secured/admin',
      status: 307,
    })
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('routes members with complete student profiles to the dashboard', async () => {
    currentUserMock.mockResolvedValue(makeUser())
    const query = mockStudentLookup({
      data: {
        id: 'student-1',
        name: 'Ada Lovelace',
        role: 'Engineer',
        batch: 'Batch 1',
      },
      error: null,
    })

    await expect(getRedirect()).resolves.toEqual({
      location: 'https://app.example.com/secured/dashboard',
      status: 307,
    })
    expect(fromMock).toHaveBeenCalledWith('students')
    expect(query.select).toHaveBeenCalledWith('id, name, role, batch')
    expect(query.eq).toHaveBeenCalledWith('email', 'member@example.com')
  })

  it('keeps members with incomplete student profiles on profile setup', async () => {
    currentUserMock.mockResolvedValue(makeUser())
    mockStudentLookup({
      data: {
        id: 'student-1',
        name: 'Ada Lovelace',
        role: '',
        batch: 'Batch 1',
      },
      error: null,
    })

    await expect(getRedirect()).resolves.toEqual({
      location: 'https://app.example.com/secured/profile',
      status: 307,
    })
  })
})
