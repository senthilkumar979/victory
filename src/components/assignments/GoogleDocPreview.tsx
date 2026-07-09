'use client'

import { getGoogleDocPreviewUrl } from '@/lib/assignments/assignmentUtils'

interface GoogleDocPreviewProps {
  url: string
}

export const GoogleDocPreview = ({ url }: GoogleDocPreviewProps) => {
  const previewUrl = getGoogleDocPreviewUrl(url)
  if (!previewUrl) return null

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700">
      <iframe
        title="Google Doc preview"
        src={previewUrl}
        className="h-[480px] w-full bg-white"
        loading="lazy"
      />
    </div>
  )
}
