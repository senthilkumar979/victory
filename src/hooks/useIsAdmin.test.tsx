import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useIsAdmin } from './useIsAdmin'

const { useUserMock } = vi.hoisted(() => ({
  useUserMock: vi.fn(),
}))

vi.mock('@clerk/nextjs', () => ({
  useUser: useUserMock,
}))

function mockMetadata(publicMetadata: Record<string, unknown> | undefined) {
  useUserMock.mockReturnValue({
    user: publicMetadata === undefined ? null : { publicMetadata },
  })
}

describe('useIsAdmin', () => {
  beforeEach(() => {
    useUserMock.mockReset()
  })

  it('returns false when there is no user or metadata', () => {
    mockMetadata(undefined)
    expect(renderHook(() => useIsAdmin()).result.current).toBe(false)

    useUserMock.mockReturnValue({ user: { publicMetadata: undefined } })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(false)
  })

  it('treats role as admin case-insensitively after trim', () => {
    mockMetadata({ role: ' Admin ' })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(true)

    mockMetadata({ role: 'student' })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(false)
  })

  it('accepts truthy isAdmin flags used by Clerk metadata', () => {
    mockMetadata({ isAdmin: true })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(true)

    mockMetadata({ isAdmin: 'true' })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(true)

    mockMetadata({ isAdmin: 1 })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(true)

    mockMetadata({ isAdmin: '1' })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(true)
  })

  it('rejects falsey isAdmin flags that Boolean() would still treat as admin', () => {
    mockMetadata({ isAdmin: false })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(false)

    mockMetadata({ isAdmin: 'false' })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(false)

    mockMetadata({ isAdmin: 0 })
    expect(renderHook(() => useIsAdmin()).result.current).toBe(false)
  })
})
