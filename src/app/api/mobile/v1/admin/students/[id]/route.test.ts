import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const {
  authenticateMobileAdminMock,
  getStudentByIdMock,
  updateStudentMock,
  mobileErrorResponseMock,
} = vi.hoisted(() => ({
  authenticateMobileAdminMock: vi.fn(),
  getStudentByIdMock: vi.fn(),
  updateStudentMock: vi.fn(),
  mobileErrorResponseMock: vi.fn((err: unknown) =>
    Response.json(
      {
        error: err instanceof Error ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 },
    ),
  ),
}))

vi.mock('@/lib/auth/authenticateMobileRequest', () => ({
  authenticateMobileAdmin: authenticateMobileAdminMock,
}))

vi.mock('@/lib/mobile/studentService', () => ({
  getStudentById: getStudentByIdMock,
  updateStudent: updateStudentMock,
}))

vi.mock('@/lib/mobile/mobileApiUtils', () => ({
  mobileErrorResponse: mobileErrorResponseMock,
}))

import { GET, PATCH } from './route'

const studentId = 'student-42'
const routeContext = {
  params: Promise.resolve({ id: studentId }),
}

const validBody = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'Engineer',
  cohortId: 'cohort-1',
  company: 'Analytical Engines',
}

function makePatchRequest(body: unknown) {
  return new Request(
    `http://localhost/api/mobile/v1/admin/students/${studentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
}

describe('/api/mobile/v1/admin/students/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authenticateMobileAdminMock.mockResolvedValue({
      user: { id: 'admin-1' },
      email: 'admin@example.com',
      userId: 'admin-1',
    })
  })

  it('GET short-circuits before loading a student when admin auth fails', async () => {
    const unauthorized = Response.json(
      { error: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: unauthorized })

    const response = await GET(new Request('http://localhost/students'), routeContext)

    expect(response).toBe(unauthorized)
    expect(getStudentByIdMock).not.toHaveBeenCalled()
  })

  it('GET returns the student for the id from route params', async () => {
    getStudentByIdMock.mockResolvedValue({
      id: studentId,
      name: 'Grace Hopper',
    })

    const response = await GET(new Request('http://localhost/students'), routeContext)

    expect(getStudentByIdMock).toHaveBeenCalledWith(studentId)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: { id: studentId, name: 'Grace Hopper' },
    })
  })

  it('GET maps service failures through mobileErrorResponse', async () => {
    const failure = new Error('Could not load student.')
    getStudentByIdMock.mockRejectedValue(failure)
    const mapped = Response.json(
      { error: 'Could not load student.', code: 'NOT_FOUND' },
      { status: 404 },
    )
    mobileErrorResponseMock.mockReturnValueOnce(mapped)

    const response = await GET(new Request('http://localhost/students'), routeContext)

    expect(mobileErrorResponseMock).toHaveBeenCalledWith(failure)
    expect(response).toBe(mapped)
  })

  it('PATCH short-circuits before validation when admin auth fails', async () => {
    const forbidden = Response.json(
      { error: 'Forbidden', code: 'FORBIDDEN' },
      { status: 403 },
    )
    authenticateMobileAdminMock.mockResolvedValue({ error: forbidden })

    const response = await PATCH(makePatchRequest(validBody), routeContext)

    expect(response).toBe(forbidden)
    expect(updateStudentMock).not.toHaveBeenCalled()
  })

  it('PATCH rejects payloads missing required profile fields', async () => {
    const response = await PATCH(
      makePatchRequest({
        name: '  ',
        email: 'ada@example.com',
        role: 'Engineer',
        cohortId: 'cohort-1',
      }),
      routeContext,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'name, email, and role are required',
      code: 'VALIDATION_ERROR',
    })
    expect(updateStudentMock).not.toHaveBeenCalled()
  })

  it('PATCH rejects payloads without a cohortId', async () => {
    const response = await PATCH(
      makePatchRequest({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: 'Engineer',
        cohortId: '',
      }),
      routeContext,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'cohortId is required',
      code: 'VALIDATION_ERROR',
    })
    expect(updateStudentMock).not.toHaveBeenCalled()
  })

  it('PATCH updates the student when the payload is valid', async () => {
    updateStudentMock.mockResolvedValue({ id: studentId, ...validBody })

    const response = await PATCH(makePatchRequest(validBody), routeContext)

    expect(updateStudentMock).toHaveBeenCalledWith(studentId, validBody)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      data: { id: studentId, ...validBody },
    })
  })

  it('PATCH maps update failures through mobileErrorResponse', async () => {
    const failure = new Error('Could not update student.')
    updateStudentMock.mockRejectedValue(failure)
    const mapped = Response.json(
      { error: 'Could not update student.', code: 'INTERNAL_ERROR' },
      { status: 500 },
    )
    mobileErrorResponseMock.mockReturnValueOnce(mapped)

    const response = await PATCH(makePatchRequest(validBody), routeContext)

    expect(mobileErrorResponseMock).toHaveBeenCalledWith(failure)
    expect(response).toBe(mapped)
  })
})
