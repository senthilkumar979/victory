import { beforeEach, describe, expect, it, vi } from 'vitest'

const { requireAdminMock, createInvitationMock } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  createInvitationMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/auth/requireAuth', () => ({
  requireAdmin: requireAdminMock,
}))

vi.mock('@clerk/nextjs/server', () => ({
  clerkClient: async () => ({
    invitations: { createInvitation: createInvitationMock },
  }),
}))

import { NextResponse } from 'next/server'

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/invitations/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as never
}

describe('POST /api/invitations/create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.NEXT_PUBLIC_APP_URL
    requireAdminMock.mockResolvedValue({
      context: { user: { id: 'admin-1' }, email: 'admin@example.com' },
    })
    createInvitationMock.mockResolvedValue({ id: 'inv_1' })
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns the admin-gate response without creating an invitation', async () => {
    requireAdminMock.mockResolvedValue({
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    })

    const response = await POST(makeRequest({ emailAddress: 'new@example.com' }))

    expect(response.status).toBe(403)
    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('rejects invalid JSON and blank emails before calling Clerk', async () => {
    const invalidJson = await POST(makeRequest('{'))
    expect(invalidJson.status).toBe(400)
    await expect(invalidJson.json()).resolves.toEqual({
      error: 'Invalid JSON body',
    })

    const blank = await POST(makeRequest({ emailAddress: '   ' }))
    expect(blank.status).toBe(400)
    await expect(blank.json()).resolves.toEqual({
      error: 'Email address is required',
    })

    expect(createInvitationMock).not.toHaveBeenCalled()
  })

  it('creates a student invitation with the default app URL', async () => {
    const response = await POST(makeRequest({ emailAddress: '  new@example.com  ' }))

    expect(createInvitationMock).toHaveBeenCalledWith({
      emailAddress: 'new@example.com',
      redirectUrl: 'https://mentorbridge.in/sign-up',
      publicMetadata: { role: 'student' },
    })
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      invitation: { id: 'inv_1' },
    })
  })

  it('maps already-exists Clerk errors to a stable 500 message', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://app.example.com'
    createInvitationMock.mockRejectedValueOnce(new Error('Invitation already exists'))

    const exists = await POST(makeRequest({ emailAddress: 'dup@example.com' }))
    expect(exists.status).toBe(500)
    await expect(exists.json()).resolves.toEqual({
      error: 'A user or invitation with this email already exists.',
    })

    createInvitationMock.mockRejectedValueOnce('boom')
    const unknown = await POST(makeRequest({ emailAddress: 'other@example.com' }))
    expect(unknown.status).toBe(500)
    await expect(unknown.json()).resolves.toEqual({
      error: 'Failed to create invitation',
    })
  })
})
