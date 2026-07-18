'use client'

import { useCallback, useState } from 'react'

export async function uploadMeetingCoverImage(
  meetingId: string,
  file: File,
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    `/api/meetings/${encodeURIComponent(meetingId)}/cover-image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  )

  const data = (await res.json().catch(() => ({}))) as {
    error?: string
    coverImageUrl?: string
  }

  if (!res.ok) {
    throw new Error(data.error ?? 'Failed to upload cover image')
  }

  if (!data.coverImageUrl?.trim()) {
    throw new Error('Upload succeeded but no image URL was returned')
  }

  return data.coverImageUrl
}

export function useMeetingCoverImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadCoverImage = useCallback(async (meetingId: string, file: File) => {
    setError(null)
    setIsUploading(true)
    try {
      return await uploadMeetingCoverImage(meetingId, file)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to upload cover image'
      setError(message)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  return { uploadCoverImage, isUploading, error }
}
