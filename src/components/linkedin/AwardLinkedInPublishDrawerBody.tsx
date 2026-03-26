'use client'

import { useState } from 'react'

import { AwardLinkedInExpandableSection } from './AwardLinkedInExpandableSection'
import { AwardLinkedInPublishDrawerPreview } from './AwardLinkedInPublishDrawerPreview'
import { AwardLinkedInPublishDrawerTop } from './AwardLinkedInPublishDrawerTop'

interface AwardLinkedInPublishDrawerBodyProps {
  studentName: string
  categoryLabel: string
  coverPrompt: string
  onCoverPromptChange: (v: string) => void
  coverUrl: string | null
  commentary: string
  onCommentaryChange: (v: string) => void
  isBootstrapping: boolean
  isGeneratingCover: boolean
  isGeneratingPost: boolean
  isBusy: boolean
  generateError: string | null
  onRegenerateCover: () => void
  onRegeneratePost: () => void
  companyDisplayName: string
  primaryLink: string
}

export const AwardLinkedInPublishDrawerBody = ({
  studentName,
  categoryLabel,
  coverPrompt,
  onCoverPromptChange,
  coverUrl,
  commentary,
  onCommentaryChange,
  isBootstrapping,
  isGeneratingCover,
  isGeneratingPost,
  isBusy,
  generateError,
  onRegenerateCover,
  onRegeneratePost,
  companyDisplayName,
  primaryLink,
}: AwardLinkedInPublishDrawerBodyProps) => {
  const [isCoverPromptOpen, setIsCoverPromptOpen] = useState(false)
  const [isPostTextOpen, setIsPostTextOpen] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <AwardLinkedInPublishDrawerTop
        studentName={studentName}
        categoryLabel={categoryLabel}
        coverUrl={coverUrl}
        isBootstrapping={isBootstrapping}
        isGeneratingCover={isGeneratingCover}
        isGeneratingPost={isGeneratingPost}
        isBusy={isBusy}
        onRegenerateCover={onRegenerateCover}
        onRegeneratePost={onRegeneratePost}
      />

      <AwardLinkedInExpandableSection
        title="Cover image prompt"
        toggleId="award-cover-prompt-toggle"
        panelId="award-cover-prompt-panel"
        open={isCoverPromptOpen}
        onToggle={() => setIsCoverPromptOpen((o) => !o)}
      >
        <label
          className="text-xs font-medium uppercase tracking-wide text-slate-400"
          htmlFor="award-cover-prompt"
        >
          Edit prompt before regenerating
        </label>
        <textarea
          id="award-cover-prompt"
          className="min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-primary"
          value={coverPrompt}
          onChange={(e) => onCoverPromptChange(e.target.value)}
          disabled={isBusy}
        />
      </AwardLinkedInExpandableSection>

      <AwardLinkedInExpandableSection
        title="Post text"
        toggleId="award-li-commentary-toggle"
        panelId="award-li-commentary-panel"
        open={isPostTextOpen}
        onToggle={() => setIsPostTextOpen((o) => !o)}
      >
        <label
          className="text-xs font-medium uppercase tracking-wide text-slate-400"
          htmlFor="award-li-commentary"
        >
          Edit before publishing
        </label>
        <textarea
          id="award-li-commentary"
          className="min-h-[200px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-primary"
          value={commentary}
          onChange={(e) => onCommentaryChange(e.target.value)}
          disabled={isBusy}
        />
      </AwardLinkedInExpandableSection>

      {generateError ? (
        <p className="px-2 text-sm text-red-400" role="alert">
          {generateError}
        </p>
      ) : null}

      <AwardLinkedInPublishDrawerPreview
        isBootstrapping={isBootstrapping}
        coverUrl={coverUrl}
        commentary={commentary}
        companyDisplayName={companyDisplayName}
        primaryLink={primaryLink}
      />
    </div>
  )
}
