import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { putMock, fromMock } = vi.hoisted(() => ({
  putMock: vi.fn(),
  fromMock: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('@vercel/blob', () => ({ put: putMock }))
vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: fromMock },
}))

import {
  resolveMeetingCoverExtension,
  saveMeetingCoverImage,
  validateMeetingCoverFile,
} from './meetingCoverImageStorage'

const FIVE_MB = 5 * 1024 * 1024

function coverFile(overrides: Partial<Pick<File, 'name' | 'type' | 'size'>> = {}) {
  return {
    name: 'cover.png',
    type: 'image/png',
    size: 1024,
    ...overrides,
  }
}

describe('validateMeetingCoverFile', () => {
  it('rejects an empty file and a file over 5 MB', () => {
    expect(validateMeetingCoverFile(coverFile({ size: 0 }))).toBe(
      'Choose an image file to upload.',
    )
    expect(validateMeetingCoverFile(coverFile({ size: FIVE_MB + 1 }))).toBe(
      'Cover image must be 5 MB or smaller.',
    )
    expect(validateMeetingCoverFile(coverFile({ size: FIVE_MB }))).toBeNull()
  })

  it('accepts a charset-qualified mime and a matching filename when type is empty', () => {
    expect(
      validateMeetingCoverFile(
        coverFile({ type: 'image/jpeg; charset=utf-8', name: 'ignored.gif' }),
      ),
    ).toBeNull()
    expect(
      resolveMeetingCoverExtension({
        type: 'image/jpeg; charset=utf-8',
        name: 'ignored.gif',
      }),
    ).toBe('jpg')
    expect(
      validateMeetingCoverFile(coverFile({ type: '', name: 'Photo.JPEG' })),
    ).toBeNull()
    expect(
      resolveMeetingCoverExtension({ type: '', name: 'Photo.JPEG' }),
    ).toBe('jpg')
  })

  it('rejects a gif mime even when the filename looks like a png', () => {
    expect(
      validateMeetingCoverFile(coverFile({ type: 'image/gif', name: 'cover.png' })),
    ).toBe('Only JPG, PNG, and WebP images are allowed.')
    expect(
      validateMeetingCoverFile(coverFile({ type: '', name: 'notes.pdf' })),
    ).toBe('Only JPG, PNG, and WebP images are allowed.')
  })
})

describe('saveMeetingCoverImage', () => {
  const originalToken = process.env.BLOB_READ_WRITE_TOKEN

  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BLOB_READ_WRITE_TOKEN = 'blob-token'
  })

  afterEach(() => {
    if (originalToken === undefined) delete process.env.BLOB_READ_WRITE_TOKEN
    else process.env.BLOB_READ_WRITE_TOKEN = originalToken
  })

  it('does not upload when blob storage is unset or the mime type is unsupported', async () => {
    process.env.BLOB_READ_WRITE_TOKEN = '   '

    await expect(
      saveMeetingCoverImage('meeting-1', Buffer.from('img'), 'image/png'),
    ).rejects.toThrow('Blob storage is not configured')
    expect(putMock).not.toHaveBeenCalled()

    process.env.BLOB_READ_WRITE_TOKEN = 'blob-token'
    await expect(
      saveMeetingCoverImage('meeting-1', Buffer.from('img'), 'image/gif'),
    ).rejects.toThrow('Unsupported image type')
    expect(putMock).not.toHaveBeenCalled()
    expect(fromMock).not.toHaveBeenCalled()
  })

  it('publishes the image and stores the returned url on the meeting', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const update = vi.fn().mockReturnValue({ eq })
    fromMock.mockReturnValue({ update })
    putMock.mockResolvedValue({ url: 'https://blob.example/meeting-9.webp' })

    await expect(
      saveMeetingCoverImage('meeting-9', Buffer.from('img'), 'image/webp'),
    ).resolves.toBe('https://blob.example/meeting-9.webp')

    expect(putMock).toHaveBeenCalledWith('meeting-9.webp', Buffer.from('img'), {
      access: 'public',
      token: 'blob-token',
      contentType: 'image/webp',
      allowOverwrite: true,
    })
    expect(fromMock).toHaveBeenCalledWith('meetings')
    expect(update).toHaveBeenCalledWith({
      cover_image_url: 'https://blob.example/meeting-9.webp',
    })
    expect(eq).toHaveBeenCalledWith('id', 'meeting-9')
  })

  it('reports a meeting update failure after the blob upload succeeds', async () => {
    const eq = vi.fn().mockResolvedValue({ error: { message: 'row missing' } })
    fromMock.mockReturnValue({ update: vi.fn().mockReturnValue({ eq }) })
    putMock.mockResolvedValue({ url: 'https://blob.example/meeting-9.jpg' })
    vi.spyOn(console, 'error').mockImplementation(() => undefined)

    await expect(
      saveMeetingCoverImage('meeting-9', Buffer.from('img'), 'image/jpeg'),
    ).rejects.toThrow('Image saved but failed to update meeting')
  })
})
