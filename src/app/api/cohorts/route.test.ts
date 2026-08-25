import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAuthMock, listCohortsMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  listCohortsMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAuth: requireAuthMock,
}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  listCohorts: listCohortsMock,
}))

import { NextResponse } from 'next/server'

import { GET } from './route'

describe('GET /api/cohorts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireAuthMock.mockResolvedValue({
      context: { user: { id: 'user-1' }, email: 'member@example.com' },
    })
    listCohortsMock.mockResolvedValue([{ id: 'c1', name: 'Batch 2026' }])
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns the auth response without listing cohorts', async () => {
    requireAuthMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    })

    const response = await GET()

    expect(response.status).toBe(401)
    expect(listCohortsMock).not.toHaveBeenCalled()
  })

  it('returns cohorts for an authenticated member', async () => {
    const response = await GET()

    expect(listCohortsMock).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      cohorts: [{ id: 'c1', name: 'Batch 2026' }],
    })
  })

  it('maps list failures to a generic 500', async () => {
    listCohortsMock.mockRejectedValue(new Error('db timeout'))

    const response = await GET()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Could not load cohorts.',
    })
  })
})
