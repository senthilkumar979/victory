'use client'

import { ImageIcon, Loader2Icon, RefreshCwIcon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'

interface AwardLinkedInPublishDrawerTopProps {
  studentName: string
  categoryLabel: string
  coverUrl: string | null
  isBootstrapping: boolean
  isGeneratingCover: boolean
  isGeneratingPost: boolean
  isBusy: boolean
  onRegenerateCover: () => void
  onRegeneratePost: () => void
}

export const AwardLinkedInPublishDrawerTop = ({
  studentName,
  categoryLabel,
  coverUrl,
  isBootstrapping,
  isGeneratingCover,
  isGeneratingPost,
  isBusy,
  onRegenerateCover,
  onRegeneratePost,
}: AwardLinkedInPublishDrawerTopProps) => (
  <div className="space-y-3 px-2">
    <p className="text-sm text-slate-600">
      <span className="font-medium text-slate-200">{studentName}</span>
      <span className="text-slate-500"> · {categoryLabel}</span>
    </p>
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        size="sm"
        type="button"
        disabled={isBusy}
        onClick={onRegenerateCover}
      >
        {isGeneratingCover ? (
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
        ) : (
          <ImageIcon className="size-4" aria-hidden />
        )}
        Regenerate cover
      </Button>
      <Button
        variant="secondary"
        size="sm"
        type="button"
        disabled={isBusy}
        onClick={onRegeneratePost}
      >
        {isGeneratingPost ? (
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCwIcon className="size-4" aria-hidden />
        )}
        Regenerate post
      </Button>
    </div>
    {coverUrl ? (
      <div className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900/40">
        {/* eslint-disable-next-line @next/next/no-img-element -- blob or Vercel URL */}
        <img
          src={coverUrl}
          alt=""
          className="aspect-video w-full object-cover"
        />
      </div>
    ) : isBootstrapping ? (
      <div className="flex min-h-[160px] items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 text-slate-400">
        <Loader2Icon className="size-8 animate-spin" aria-hidden />
      </div>
    ) : null}
  </div>
)
