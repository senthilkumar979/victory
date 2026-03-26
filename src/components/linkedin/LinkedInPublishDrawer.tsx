'use client'

import { Loader2Icon } from 'lucide-react'

import { gooeyToast } from 'goey-toast'

import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { Button } from '@/atoms/button/Button'

import { LinkedInFeedPreview } from './LinkedInFeedPreview'
import { useLinkedInPostDraft } from './useLinkedInPostDraft'

export interface LinkedInPublishDrawerProps {
  isOpen: boolean
  onClose: () => void
  onPublished?: () => void
  contextTitle: string
  contextDescription: string
  primaryLink: string
  coverImageUrl: string
  companyDisplayName: string
  contextExtra?: string
}

export const LinkedInPublishDrawer = ({
  isOpen,
  onClose,
  onPublished,
  contextTitle,
  contextDescription,
  primaryLink,
  coverImageUrl,
  companyDisplayName,
  contextExtra,
}: LinkedInPublishDrawerProps) => {
  const {
    commentary,
    setCommentary,
    isGenerating,
    isPublishing,
    publish,
    generateError,
  } = useLinkedInPostDraft({
    isOpen,
    contextTitle,
    contextDescription,
    primaryLink,
    contextExtra,
  })

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxl">
      <Drawer.Title description="Review the generated copy, edit if needed, then publish to your LinkedIn company Page. Requires LINKEDIN_ACCESS_TOKEN and organization URN on the server.">
        Publish to LinkedIn
      </Drawer.Title>
      <Drawer.Body>
        <div className="grid gap-6 lg:grid-cols-1">
          <div className="space-y-3 px-2">
            <label
              className="text-xs font-medium uppercase tracking-wide text-slate-400"
              htmlFor="li-commentary"
            >
              Post text
            </label>
            <textarea
              id="li-commentary"
              className="min-h-[220px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={commentary}
              onChange={(e) => setCommentary(e.target.value)}
              disabled={isGenerating || isPublishing}
            />
            {generateError ? (
              <p className="text-sm text-red-400">{generateError}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Preview
            </p>
            {isGenerating ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 text-slate-400">
                <Loader2Icon className="size-8 animate-spin" aria-hidden />
              </div>
            ) : (
              <LinkedInFeedPreview
                companyDisplayName={companyDisplayName}
                commentary={commentary || '…'}
                coverImageUrl={coverImageUrl}
                primaryLink={primaryLink}
              />
            )}
          </div>
        </div>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="button"
          disabled={isGenerating || isPublishing || !commentary.trim()}
          onClick={() =>
            void publish({
              coverImageUrl,
              imageAltText: contextTitle,
              onSuccess: () => {
                gooeyToast.success('Published to LinkedIn.', {
                  description: contextTitle,
                  bounce: 0.45,
                  borderColor: '#E0E0E0',
                  borderWidth: 2,
                  timing: { displayDuration: 2500 },
                })
                onPublished?.()
                onClose()
              },
            })
          }
        >
          {isPublishing ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : null}
          Publish
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
