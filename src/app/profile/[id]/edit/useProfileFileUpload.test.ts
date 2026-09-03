import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useProfileFileUpload } from './useProfileFileUpload'

const { uploadMock } = vi.hoisted(() => ({
  uploadMock: vi.fn(),
}))

vi.mock('@vercel/blob/client', () => ({
  upload: uploadMock,
}))

function file(name: string, type: string): File {
  return new File(['bytes'], name, { type })
}

afterEach(() => {
  cleanup()
})

describe('useProfileFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    uploadMock.mockResolvedValue({ url: 'https://blob.example/file' })
  })

  it('does not upload when the student id is missing or whitespace', async () => {
    const { result } = renderHook(() => useProfileFileUpload('   '))

    let uploaded: string | null = 'unset'
    await act(async () => {
      uploaded = await result.current.uploadFile(
        file('resume.pdf', 'application/pdf'),
        'resume',
      )
    })

    expect(uploaded).toBeNull()
    expect(uploadMock).not.toHaveBeenCalled()
    expect(result.current.error).toBe(
      'Save your profile once first — uploads need your student ID. After saving, try again.',
    )
  })

  it('rejects disallowed resume and picture types before calling blob upload', async () => {
    const { result } = renderHook(() => useProfileFileUpload('student-1'))

    await act(async () => {
      await result.current.uploadFile(file('notes.txt', 'text/plain'), 'resume')
    })
    expect(result.current.error).toBe('Only PDF files are allowed')

    await act(async () => {
      await result.current.uploadFile(file('avatar.gif', 'image/gif'), 'picture')
    })
    expect(result.current.error).toBe(
      'Only JPG, PNG, and JPEG images are allowed',
    )
    expect(uploadMock).not.toHaveBeenCalled()
  })

  it('normalizes jpeg pictures to .jpg and accepts PDF resumes by MIME type', async () => {
    const { result } = renderHook(() => useProfileFileUpload('student-1'))
    const picture = file('Headshot.JPEG', 'image/jpeg')
    const resume = file('cv', 'application/pdf')

    let pictureUrl: string | null = null
    await act(async () => {
      pictureUrl = await result.current.uploadFile(picture, 'picture')
    })
    expect(pictureUrl).toBe('https://blob.example/file')
    expect(uploadMock).toHaveBeenCalledWith(
      'profiles/student-1.jpg',
      picture,
      { access: 'public', handleUploadUrl: '/api/profile/upload' },
    )

    let resumeUrl: string | null = null
    await act(async () => {
      resumeUrl = await result.current.uploadFile(resume, 'resume')
    })
    expect(resumeUrl).toBe('https://blob.example/file')
    expect(uploadMock).toHaveBeenLastCalledWith(
      'profiles/student-1.pdf',
      resume,
      { access: 'public', handleUploadUrl: '/api/profile/upload' },
    )
  })

  it('maps a non-Error upload rejection to the generic fallback', async () => {
    uploadMock.mockRejectedValue({ message: 'quota' })
    const { result } = renderHook(() => useProfileFileUpload('student-1'))

    await act(async () => {
      await result.current.uploadFile(
        file('resume.pdf', 'application/pdf'),
        'resume',
      )
    })

    expect(result.current.error).toBe('Upload failed')
  })
})
