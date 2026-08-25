import { beforeEach, describe, expect, it, vi } from 'vitest'

const { listCohortsMock } = vi.hoisted(() => ({
  listCohortsMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/assignments/assignmentService', () => ({
  listCohorts: listCohortsMock,
}))

import { GET } from './route'

describe('GET /api/public/cohorts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listCohortsMock.mockResolvedValue([{ id: 'c1', name: 'Batch 2026' }])
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('lists cohorts without requiring authentication', async () => {
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
