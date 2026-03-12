'use client'

import { useState, useCallback } from 'react'
import { upload } from '@vercel/blob/client'

const UPLOAD_URL = '/api/profile/upload'
const PROFILE_PREFIX = 'profiles/'

type UploadType = 'resume' | 'picture'

const EXT_MAP: Record<UploadType, Record<string, string>> = {
  resume: { 'application/pdf': 'pdf' },
  picture: {
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/png': 'png',
  },
}

function getExt(file: File, type: UploadType): string | null {
  const map = EXT_MAP[type]
  return map[file.type] ?? null
}

export const useProfileFileUpload = (studentId: string) => {
  const [uploading, setUploading] = useState<UploadType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    async (file: File, type: UploadType): Promise<string | null> => {
      if (!studentId) return null
      setError(null)
      setUploading(type)

      try {
        const ext = getExt(file, type)
        if (!ext) {
          throw new Error(
            type === 'resume'
              ? 'Only PDF files are allowed'
              : 'Only JPG, PNG, and JPEG images are allowed',
          )
        }

        const pathname =
          type === 'resume'
            ? `${PROFILE_PREFIX}${studentId}.pdf`
            : `${PROFILE_PREFIX}${studentId}.${ext}`

        const blob = await upload(pathname, file, {
          access: 'public',
          handleUploadUrl: UPLOAD_URL,
        })

        return blob.url
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setError(msg)
        return null
      } finally {
        setUploading(null)
      }
    },
    [studentId],
  )

  return { uploadFile, uploading, error }
}
