'use client'

import { useState, useCallback } from 'react'
import { upload } from '@vercel/blob/client'

/** Immediate Vercel Blob upload on file pick; DB write is only on profile Save (parent form). */
const UPLOAD_URL = '/api/profile/upload'
const PROFILE_PREFIX = 'profiles/'

type UploadType = 'resume' | 'picture'

const RESUME_NAME_EXT = /\.pdf$/i

function extFromPictureFilename(name: string): string | null {
  const m = name.toLowerCase().match(/\.(jpe?g|png)$/)
  if (!m) return null
  if (m[1] === 'jpeg' || m[1] === 'jpg') return 'jpg'
  return 'png'
}

function extFromResumeFilename(name: string): string | null {
  return RESUME_NAME_EXT.test(name) ? 'pdf' : null
}

function getExt(file: File, type: UploadType): string | null {
  if (type === 'resume') {
    const fromName = extFromResumeFilename(file.name)
    if (fromName) return fromName
    if (file.type === 'application/pdf') return 'pdf'
    return null
  }
  const fromName = extFromPictureFilename(file.name)
  if (fromName) return fromName
  const t = file.type.toLowerCase()
  if (t === 'image/jpeg' || t === 'image/jpg') return 'jpg'
  if (t === 'image/png') return 'png'
  return null
}

export const useProfileFileUpload = (studentId: string) => {
  const [uploading, setUploading] = useState<UploadType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    async (file: File, type: UploadType): Promise<string | null> => {
      if (!studentId?.trim()) {
        setError(
          'Save your profile once first — uploads need your student ID. After saving, try again.',
        )
        return null
      }
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
