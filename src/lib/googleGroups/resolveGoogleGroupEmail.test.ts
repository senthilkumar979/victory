import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import {
  isEmailAddress,
  resolveGoogleGroupEmail,
} from './resolveGoogleGroupEmail'

vi.mock('@/lib/supabaseAdmin', () => ({
  supabaseAdmin: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { email: 'cohort@googlegroups.com' },
            error: null,
          }),
        }),
      }),
    }),
  },
}))

describe('isEmailAddress', () => {
  it('accepts group emails', () => {
    expect(isEmailAddress('mentorbridge@googlegroups.com')).toBe(true)
  })

  it('rejects UUIDs', () => {
    expect(isEmailAddress('a1b2c3d4-e5f6-7890-abcd-ef1234567890')).toBe(false)
  })
})

describe('resolveGoogleGroupEmail', () => {
  it('returns email as-is when already an address', async () => {
    await expect(
      resolveGoogleGroupEmail('team@googlegroups.com'),
    ).resolves.toBe('team@googlegroups.com')
  })

  it('resolves google_groups.id to email', async () => {
    await expect(
      resolveGoogleGroupEmail('a1b2c3d4-e5f6-7890-abcd-ef1234567890'),
    ).resolves.toBe('cohort@googlegroups.com')
  })

  it('returns null for empty input', async () => {
    await expect(resolveGoogleGroupEmail('')).resolves.toBeNull()
  })
})
