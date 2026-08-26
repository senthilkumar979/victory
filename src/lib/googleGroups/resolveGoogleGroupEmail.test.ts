import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const dbState = vi.hoisted(() => ({
  client: null as { from: ReturnType<typeof vi.fn> } | null,
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import {
  isEmailAddress,
  resolveGoogleGroupEmail,
} from './resolveGoogleGroupEmail'

const GROUP_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

function mockGoogleGroupsLookup(result: {
  data: { email: string | null } | null
  error: { message: string } | null
}) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  }
  query.select.mockReturnValue(query)
  query.eq.mockReturnValue(query)
  dbState.client = { from: vi.fn(() => query) }
  return query
}

describe('isEmailAddress', () => {
  it('accepts group emails, including surrounding whitespace', () => {
    expect(isEmailAddress('mentorbridge@googlegroups.com')).toBe(true)
    expect(isEmailAddress('  team@mentorbridge.in  ')).toBe(true)
  })

  it('rejects UUIDs, empty values, and addresses without a dotted domain', () => {
    expect(isEmailAddress(GROUP_ID)).toBe(false)
    expect(isEmailAddress('')).toBe(false)
    expect(isEmailAddress('not-an-email')).toBe(false)
    expect(isEmailAddress('group@local')).toBe(false)
  })
})

describe('resolveGoogleGroupEmail', () => {
  beforeEach(() => {
    dbState.client = null
    mockGoogleGroupsLookup({
      data: { email: 'cohort@googlegroups.com' },
      error: null,
    })
  })

  it('returns a trimmed email when the input is already an address', async () => {
    await expect(
      resolveGoogleGroupEmail('  team@googlegroups.com  '),
    ).resolves.toBe('team@googlegroups.com')
    expect(dbState.client?.from).not.toHaveBeenCalled()
  })

  it('resolves google_groups.id to a stored email', async () => {
    const query = mockGoogleGroupsLookup({
      data: { email: '  cohort@googlegroups.com  ' },
      error: null,
    })

    await expect(resolveGoogleGroupEmail(GROUP_ID)).resolves.toBe(
      'cohort@googlegroups.com',
    )
    expect(dbState.client?.from).toHaveBeenCalledWith('google_groups')
    expect(query.eq).toHaveBeenCalledWith('id', GROUP_ID)
  })

  it('returns null for empty, whitespace, or missing input', async () => {
    await expect(resolveGoogleGroupEmail('')).resolves.toBeNull()
    await expect(resolveGoogleGroupEmail('   ')).resolves.toBeNull()
    await expect(resolveGoogleGroupEmail(null)).resolves.toBeNull()
    await expect(resolveGoogleGroupEmail(undefined)).resolves.toBeNull()
  })

  it('returns null when the admin client is not configured', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    dbState.client = null

    await expect(resolveGoogleGroupEmail(GROUP_ID)).resolves.toBeNull()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('returns null when the lookup fails or the stored value is not an email', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    mockGoogleGroupsLookup({
      data: null,
      error: { message: 'relation missing' },
    })
    await expect(resolveGoogleGroupEmail(GROUP_ID)).resolves.toBeNull()

    mockGoogleGroupsLookup({
      data: { email: 'not-a-deliverable-address' },
      error: null,
    })
    await expect(resolveGoogleGroupEmail(GROUP_ID)).resolves.toBeNull()

    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })
})
