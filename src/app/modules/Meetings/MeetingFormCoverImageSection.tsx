'use client'

import { useEffect, useRef, useState } from 'react'
import { ImageIcon, Loader2, XIcon } from 'lucide-react'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { joinClassNames } from '@/utils/tailwindUtils'

import { useMeetingCoverImageUpload } from './useMeetingCoverImageUpload'

interface MeetingFormCoverImageSectionProps {
  formId: string
  meetingId?: string
  coverImageUrl: string
  onCoverImageUrlChange: (url: string) => void
  stagedCoverFile: File | null
  onStagedCoverFileChange: (file: File | null) => void
}

const pickerButtonClass = joinClassNames(
  'flex w-full cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
  'border-slate-600 bg-slate-800 text-slate-100',
  'hover:border-primary/60 hover:bg-slate-800/80',
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary',
  'disabled:cursor-not-allowed disabled:opacity-60',
)

export const MeetingFormCoverImageSection = ({
  formId,
  meetingId,
  coverImageUrl,
  onCoverImageUrlChange,
  stagedCoverFile,
  onStagedCoverFileChange,
}: MeetingFormCoverImageSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null)
  const { uploadCoverImage, isUploading, error } = useMeetingCoverImageUpload()

  useEffect(() => {
    if (!stagedCoverFile) {
      setLocalPreviewUrl(null)
      return
    }
    const objectUrl = URL.createObjectURL(stagedCoverFile)
    setLocalPreviewUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [stagedCoverFile])

  const previewUrl = localPreviewUrl || coverImageUrl.trim() || null

  const handleClear = () => {
    onStagedCoverFileChange(null)
    onCoverImageUrlChange('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleFileChange = async (file: File | null) => {
    if (!file) return
    onStagedCoverFileChange(file)

    if (!meetingId?.trim()) return

    const url = await uploadCoverImage(meetingId, file)
    if (url) {
      onCoverImageUrlChange(url)
      onStagedCoverFileChange(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <FormLabel htmlFor={`${formId}-cover-image`} isDarkMode>
        Cover image
      </FormLabel>
      <p className="text-xs text-slate-500">
        {meetingId
          ? 'Upload a 16:9 image (JPG, PNG, or WebP). It is saved to storage immediately.'
          : 'Choose an image now — it uploads when you create the meeting.'}
      </p>

      {error ? (
        <p className="text-xs text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {previewUrl ? (
        <div className="relative overflow-hidden rounded-lg border border-slate-700 bg-slate-900/40">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob or remote preview */}
          <img
            src={previewUrl}
            alt="Cover preview"
            className="aspect-video w-full object-cover"
          />
          {!isUploading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-full border border-slate-600 bg-slate-950/90 text-slate-300 hover:text-primary"
              aria-label="Remove cover image"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
      ) : null}

      <input
        ref={inputRef}
        id={`${formId}-cover-image`}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        disabled={isUploading}
        onChange={(e) => {
          const file = e.target.files?.[0] ?? null
          void handleFileChange(file)
        }}
      />

      <button
        type="button"
        className={pickerButtonClass}
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="size-4 shrink-0 animate-spin" />
        ) : (
          <ImageIcon className="size-4 shrink-0" />
        )}
        <span className="truncate">
          {isUploading
            ? 'Uploading cover image...'
            : previewUrl
              ? 'Replace cover image'
              : 'Choose cover image (JPG, PNG, WebP)'}
        </span>
      </button>
    </div>
  )
}
