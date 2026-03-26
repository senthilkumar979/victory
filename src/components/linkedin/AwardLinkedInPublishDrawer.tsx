'use client'

import { Loader2Icon } from 'lucide-react'

import { gooeyToast } from 'goey-toast'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'
import { getAwardLinkedInPrimaryLink } from '@/lib/linkedin/buildAwardLinkedInPostRequest'
import { Button } from '@/atoms/button/Button'
import { Drawer } from '@/ui/organisms/drawer/Drawer'

import { AwardLinkedInPublishDrawerBody } from './AwardLinkedInPublishDrawerBody'
import { useAwardLinkedInPublish } from './useAwardLinkedInPublish'

export interface AwardLinkedInPublishDrawerProps {
  award: AwardFormState | null
  categoryName: string
  isOpen: boolean
  onClose: () => void
  onPublished?: () => void
  companyDisplayName: string
}

export const AwardLinkedInPublishDrawer = ({
  award,
  categoryName,
  isOpen,
  onClose,
  onPublished,
  companyDisplayName,
}: AwardLinkedInPublishDrawerProps) => {
  const draft = useAwardLinkedInPublish({ award, categoryName, isOpen })

  const studentName =
    award?.student?.name?.trim() || award?.awardedTo || 'Student'
  const imageAltText = `${studentName} — ${categoryName || 'Award'}`
  const categoryLabel = categoryName || '—'

  if (!award?.id) return null

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxxl">
      <Drawer.Title description="Review the AI-generated cover and post. Regenerate either asset, edit the post text if needed, then publish to your LinkedIn company Page.">
        Publish award to LinkedIn
      </Drawer.Title>
      <Drawer.Body>
        <AwardLinkedInPublishDrawerBody
          studentName={studentName}
          categoryLabel={categoryLabel}
          coverPrompt={draft.coverPrompt}
          onCoverPromptChange={draft.setCoverPrompt}
          coverUrl={draft.coverUrl}
          commentary={draft.commentary}
          onCommentaryChange={draft.setCommentary}
          isBootstrapping={draft.isBootstrapping}
          isGeneratingCover={draft.isGeneratingCover}
          isGeneratingPost={draft.isGeneratingPost}
          isBusy={draft.isBusy}
          generateError={draft.generateError}
          onRegenerateCover={() => void draft.regenerateCover()}
          onRegeneratePost={() => void draft.regeneratePost()}
          companyDisplayName={companyDisplayName}
          primaryLink={getAwardLinkedInPrimaryLink()}
        />
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          type="button"
          disabled={draft.isBusy || !draft.commentary.trim() || !draft.coverUrl}
          onClick={() =>
            void draft.publish({
              imageAltText,
              onSuccess: () => {
                gooeyToast.success('Published to LinkedIn.', {
                  description: imageAltText,
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
          {draft.isPublishing ? (
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
          ) : null}
          Publish
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
