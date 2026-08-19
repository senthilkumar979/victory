import { beforeEach, describe, expect, it, vi } from 'vitest'

const { authMock, saveMeetingCoverImageMock, supabaseState } = vi.hoisted(
  () => ({
    authMock: vi.fn(),
    saveMeetingCoverImageMock: vi.fn(),
    supabaseState: { client: null as unknown },
  }),
)

vi.mock('server-only', () => ({}))

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return supabaseState.client
  },
}))

vi.mock('@/lib/meetingCoverImageStorage', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/lib/meetingCoverImageStorage')>()
  return {
    ...original,
    saveMeetingCoverImage: saveMeetingCoverImageMock,
  }
})

import { POST } from './route'

function makeFile(name: string, type: string, bytes: number[] = [1, 2, 3]) {
  return new File([new Uint8Array(bytes)], name, { type })
}

function makeUploadRequest(
  file: File | string | null,
  meetingId = 'meeting-1',
) {
  return {
    request: {
      formData: async () => ({
        get: (key: string) => (key === 'file' ? file : null),
      }),
    },
    context: { params: Promise.resolve({ id: meetingId }) },
  }
}

describe('POST /api/meetings/[id]/cover-image/upload', () => {
  const maybeSingle = vi.fn()
  const eq = vi.fn()
  const select = vi.fn()
  const from = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    authMock.mockResolvedValue({ userId: 'user-1' })
    maybeSingle.mockResolvedValue({ data: { id: 'meeting-1' }, error: null })
    eq.mockReturnValue({ maybeSingle })
    select.mockReturnValue({ eq })
    from.mockReturnValue({ select })
    supabaseState.client = { from }
    saveMeetingCoverImageMock.mockResolvedValue(
      'https://blob.example/meeting-1.png',
    )
  })

  it('returns 401 when the caller is unauthenticated', async () => {
    authMock.mockResolvedValue({ userId: null })
    const { request, context } = makeUploadRequest(
      makeFile('cover.png', 'image/png'),
    )

    const response = await POST(request as never, context)

    expect(response.status).toBe(401)
    expect(from).not.toHaveBeenCalled()
    expect(saveMeetingCoverImageMock).not.toHaveBeenCalled()
  })

  it('rejects an empty meeting id before looking up the row', async () => {
    const { request, context } = makeUploadRequest(
      makeFile('cover.png', 'image/png'),
      '   ',
    )

    const response = await POST(request as never, context)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid meeting id',
    })
    expect(from).not.toHaveBeenCalled()
  })

  it('returns 404 when the meeting does not exist', async () => {
    maybeSingle.mockResolvedValueOnce({ data: null, error: null })
    const { request, context } = makeUploadRequest(
      makeFile('cover.png', 'image/png'),
    )

    const response = await POST(request as never, context)

    expect(from).toHaveBeenCalledWith('meetings')
    expect(eq).toHaveBeenCalledWith('id', 'meeting-1')
    expect(response.status).toBe(404)
    expect(saveMeetingCoverImageMock).not.toHaveBeenCalled()
  })

  it('returns 400 when the image file is missing or invalid', async () => {
    const missingUpload = makeUploadRequest(null)
    const missing = await POST(
      missingUpload.request as never,
      missingUpload.context,
    )
    expect(missing.status).toBe(400)
    await expect(missing.json()).resolves.toEqual({
      error: 'Missing image file',
    })

    const invalidUpload = makeUploadRequest(
      makeFile('notes.txt', 'text/plain'),
    )
    const invalid = await POST(
      invalidUpload.request as never,
      invalidUpload.context,
    )
    expect(invalid.status).toBe(400)
    await expect(invalid.json()).resolves.toEqual({
      error: 'Only JPG, PNG, and WebP images are allowed.',
    })
    expect(saveMeetingCoverImageMock).not.toHaveBeenCalled()
  })

  it('saves a valid PNG and returns the stored URL', async () => {
    const file = makeFile('cover.png', 'image/png')
    const { request, context } = makeUploadRequest(file)

    const response = await POST(request as never, context)

    expect(saveMeetingCoverImageMock).toHaveBeenCalledWith(
      'meeting-1',
      expect.any(Buffer),
      'image/png',
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      coverImageUrl: 'https://blob.example/meeting-1.png',
    })
  })

  it('maps storage failures to a 500 with the thrown message', async () => {
    saveMeetingCoverImageMock.mockRejectedValueOnce(
      new Error('Blob storage is not configured'),
    )
    const { request, context } = makeUploadRequest(
      makeFile('cover.png', 'image/png'),
    )

    const response = await POST(request as never, context)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Blob storage is not configured',
    })
  })
})
