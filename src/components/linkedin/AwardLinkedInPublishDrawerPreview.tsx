'use client'

import { Loader2Icon } from 'lucide-react'

import { LinkedInFeedPreview } from './LinkedInFeedPreview'

interface AwardLinkedInPublishDrawerPreviewProps {
  isBootstrapping: boolean
  coverUrl: string | null
  commentary: string
  companyDisplayName: string
  primaryLink: string
}

export const AwardLinkedInPublishDrawerPreview = ({
  isBootstrapping,
  coverUrl,
  commentary,
  companyDisplayName,
  primaryLink,
}: AwardLinkedInPublishDrawerPreviewProps) => (
  <div className="space-y-2 px-2">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
      Preview
    </p>
    {isBootstrapping && !coverUrl ? (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 text-slate-400">
        <Loader2Icon className="size-8 animate-spin" aria-hidden />
      </div>
    ) : coverUrl ? (
      <LinkedInFeedPreview
        companyDisplayName={companyDisplayName}
        commentary={commentary || '…'}
        coverImageUrl={coverUrl}
        primaryLink={primaryLink}
      />
    ) : (
      <p className="text-sm text-slate-500">
        Generate a cover image to see the feed preview.
      </p>
    )}
  </div>
)
