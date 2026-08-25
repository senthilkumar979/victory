import { beforeEach, describe, expect, it, vi } from 'vitest'

const { handleUploadMock } = vi.hoisted(() => ({
  handleUploadMock: vi.fn(),
}))

vi.mock('@vercel/blob/client', () => ({
  handleUpload: (...args: unknown[]) => handleUploadMock(...args),
}))

import { POST } from './route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/profile/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
}

interface TokenConfig {
  allowedContentTypes: string[]
  addRandomSuffix: boolean
  allowOverwrite: boolean
}

function mockHandleUploadPassthrough() {
  handleUploadMock.mockImplementation(
    async ({
      body,
      onBeforeGenerateToken,
    }: {
      body: { payload?: { pathname?: string } }
      onBeforeGenerateToken: (pathname: string) => Promise<TokenConfig>
    }) => {
      const pathname = body.payload?.pathname ?? ''
      const tokenPayload = await onBeforeGenerateToken(pathname)
      return { type: 'blob.generate-client-token', clientToken: 'tok', tokenPayload }
    },
  )
}

describe('POST /api/profile/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockHandleUploadPassthrough()
  })

  it('rejects invalid JSON before calling blob upload', async () => {
    const response = await POST(makeRequest('{'))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid request body',
    })
    expect(handleUploadMock).not.toHaveBeenCalled()
  })

  it('rejects pathnames outside profiles/ and unsupported extensions', async () => {
    const outside = await POST(
      makeRequest({ payload: { pathname: 'resumes/user.pdf' } }),
    )
    expect(outside.status).toBe(400)
    await expect(outside.json()).resolves.toEqual({
      error:
        'Invalid pathname. Use profiles/[id].pdf or profiles/[id].(jpg|jpeg|png)',
    })

    const noExt = await POST(
      makeRequest({ payload: { pathname: 'profiles/user' } }),
    )
    expect(noExt.status).toBe(400)

    const hidden = await POST(
      makeRequest({ payload: { pathname: 'profiles/.pdf' } }),
    )
    expect(hidden.status).toBe(400)

    const exe = await POST(
      makeRequest({ payload: { pathname: 'profiles/user.exe' } }),
    )
    expect(exe.status).toBe(400)
  })

  it('issues a PDF token with overwrite and no random suffix', async () => {
    const response = await POST(
      makeRequest({ payload: { pathname: 'profiles/stu-1.PDF' } }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      type: 'blob.generate-client-token',
      clientToken: 'tok',
      tokenPayload: {
        allowedContentTypes: ['application/pdf'],
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    })
  })

  it('issues an image token for jpg/jpeg/png under a nested profiles path', async () => {
    const response = await POST(
      makeRequest({ payload: { pathname: 'profiles/stu-1/avatar.jpeg' } }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      tokenPayload: {
        allowedContentTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    })
  })

  it('maps non-Error upload failures to a generic 400', async () => {
    handleUploadMock.mockRejectedValueOnce('blob down')

    const response = await POST(
      makeRequest({ payload: { pathname: 'profiles/stu-1.png' } }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Upload failed' })
  })
})
