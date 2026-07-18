import 'server-only'

import { put } from '@vercel/blob'

import { supabase } from '@/lib/supabaseClient'

export const MEETING_COVER_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

const MAX_COVER_IMAGE_BYTES = 5 * 1024 * 1024

export function extensionFromMimeType(mimeType: string): string | null {
  const normalized = mimeType.toLowerCase().split(';')[0]?.trim() ?? ''
  if (normalized === 'image/jpeg' || normalized === 'image/jpg') return 'jpg'
  if (normalized === 'image/png') return 'png'
  if (normalized === 'image/webp') return 'webp'
  return null
}

export function extensionFromFilename(name: string): string | null {
  const match = name.toLowerCase().match(/\.(jpe?g|png|webp)$/)
  if (!match) return null
  if (match[1] === 'jpeg' || match[1] === 'jpg') return 'jpg'
  return match[1]
}

export function resolveMeetingCoverExtension(
  file: Pick<File, 'name' | 'type'>,
): string | null {
  return extensionFromMimeType(file.type) ?? extensionFromFilename(file.name)
}

export function validateMeetingCoverFile(
  file: Pick<File, 'name' | 'type' | 'size'>,
): string | null {
  if (!file.size) return 'Choose an image file to upload.'
  if (file.size > MAX_COVER_IMAGE_BYTES) {
    return 'Cover image must be 5 MB or smaller.'
  }
  const ext = resolveMeetingCoverExtension(file)
  if (!ext) return 'Only JPG, PNG, and WebP images are allowed.'
  if (file.type) {
    const normalized = file.type.toLowerCase().split(';')[0]?.trim() ?? ''
    const allowed = MEETING_COVER_IMAGE_TYPES as readonly string[]
    if (!allowed.includes(normalized)) {
      return 'Only JPG, PNG, and WebP images are allowed.'
    }
  }
  return null
}

export async function saveMeetingCoverImage(
  meetingId: string,
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim()
  if (!token) {
    throw new Error('Blob storage is not configured')
  }

  const ext = extensionFromMimeType(mimeType)
  if (!ext) throw new Error('Unsupported image type')

  const finalPathname = `${meetingId}.${ext}`
  const blob = await put(finalPathname, buffer, {
    access: 'public',
    token,
    contentType: mimeType,
    allowOverwrite: true,
  })

  const { error: updateError } = await supabase
    .from('meetings')
    .update({ cover_image_url: blob.url })
    .eq('id', meetingId)

  if (updateError) {
    console.error('[meeting cover upload] supabase update', updateError)
    throw new Error('Image saved but failed to update meeting')
  }

  return blob.url
}
