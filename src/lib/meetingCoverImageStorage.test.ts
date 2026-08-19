import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { putMock, supabaseState } = vi.hoisted(() => ({
  putMock: vi.fn(),
  supabaseState: { client: null as unknown },
}))

vi.mock('server-only', () => ({}))

vi.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => putMock(...args),
}))

vi.mock('@/lib/supabaseClient', () => ({
  get supabase() {
    return supabaseState.client
  },
}))

import {
  extensionFromFilename,
  extensionFromMimeType,
  resolveMeetingCoverExtension,
  saveMeetingCoverImage,
  validateMeetingCoverFile,
} from './meetingCoverImageStorage'

function fileLike(overrides: {
  name?: string
  type?: string
  size?: number
}): Pick<File, 'name' | 'type' | 'size'> {
  return {
    name: 'cover.png',
    type: 'image/png',
    size: 1024,
    ...overrides,
  }
}

describe('meeting cover image validation', () => {
  it('maps MIME types including charset suffixes', () => {
    expect(extensionFromMimeType('image/jpeg; charset=binary')).toBe('jpg')
    expect(extensionFromMimeType('IMAGE/JPG')).toBe('jpg')
    expect(extensionFromMimeType('image/png')).toBe('png')
    expect(extensionFromMimeType('image/webp')).toBe('webp')
    expect(extensionFromMimeType('image/gif')).toBeNull()
    expect(extensionFromMimeType('')).toBeNull()
  })

  it('maps filename extensions and rejects unsupported suffixes', () => {
    expect(extensionFromFilename('banner.JPEG')).toBe('jpg')
    expect(extensionFromFilename('banner.jpg')).toBe('jpg')
    expect(extensionFromFilename('banner.png')).toBe('png')
    expect(extensionFromFilename('banner.webp')).toBe('webp')
    expect(extensionFromFilename('banner.svg')).toBeNull()
    expect(extensionFromFilename('banner')).toBeNull()
  })

  it('prefers MIME type over filename when resolving the extension', () => {
    expect(
      resolveMeetingCoverExtension({ name: 'cover.gif', type: 'image/webp' }),
    ).toBe('webp')
    expect(
      resolveMeetingCoverExtension({ name: 'cover.png', type: '' }),
    ).toBe('png')
  })

  it('rejects empty, oversized, and disallowed files', () => {
    expect(validateMeetingCoverFile(fileLike({ size: 0 }))).toBe(
      'Choose an image file to upload.',
    )
    expect(validateMeetingCoverFile(fileLike({ size: 5 * 1024 * 1024 + 1 }))).toBe(
      'Cover image must be 5 MB or smaller.',
    )
    expect(
      validateMeetingCoverFile(
        fileLike({ name: 'notes.txt', type: 'text/plain' }),
      ),
    ).toBe('Only JPG, PNG, and WebP images are allowed.')
    expect(
      validateMeetingCoverFile(
        fileLike({ name: 'cover.png', type: 'application/octet-stream' }),
      ),
    ).toBe('Only JPG, PNG, and WebP images are allowed.')
  })

  it('accepts a valid PNG under the size limit', () => {
    expect(validateMeetingCoverFile(fileLike({ size: 5 * 1024 * 1024 }))).toBeNull()
  })
})

describe('saveMeetingCoverImage', () => {
  const eq = vi.fn()
  const update = vi.fn()
  const from = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    eq.mockResolvedValue({ error: null })
    update.mockReturnValue({ eq })
    from.mockReturnValue({ update })
    supabaseState.client = { from }
    putMock.mockResolvedValue({ url: 'https://blob.example/meeting-1.png' })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('throws when blob storage is not configured', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', '  ')

    await expect(
      saveMeetingCoverImage('meeting-1', Buffer.from('img'), 'image/png'),
    ).rejects.toThrow('Blob storage is not configured')
    expect(putMock).not.toHaveBeenCalled()
  })

  it('rejects unsupported MIME types before uploading', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'token')

    await expect(
      saveMeetingCoverImage('meeting-1', Buffer.from('img'), 'image/gif'),
    ).rejects.toThrow('Unsupported image type')
    expect(putMock).not.toHaveBeenCalled()
  })

  it('uploads with overwrite and persists the public URL', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob-token')
    const buffer = Buffer.from('png-bytes')

    await expect(
      saveMeetingCoverImage('meeting-1', buffer, 'image/png'),
    ).resolves.toBe('https://blob.example/meeting-1.png')

    expect(putMock).toHaveBeenCalledWith('meeting-1.png', buffer, {
      access: 'public',
      token: 'blob-token',
      contentType: 'image/png',
      allowOverwrite: true,
    })
    expect(from).toHaveBeenCalledWith('meetings')
    expect(update).toHaveBeenCalledWith({
      cover_image_url: 'https://blob.example/meeting-1.png',
    })
    expect(eq).toHaveBeenCalledWith('id', 'meeting-1')
  })

  it('throws when the meeting row cannot be updated after upload', async () => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'blob-token')
    eq.mockResolvedValueOnce({ error: { message: 'db down' } })

    await expect(
      saveMeetingCoverImage('meeting-1', Buffer.from('img'), 'image/jpeg'),
    ).rejects.toThrow('Image saved but failed to update meeting')
  })
})
