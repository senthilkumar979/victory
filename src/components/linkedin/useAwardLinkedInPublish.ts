import { useCallback, useState } from 'react'

import { gooeyToast } from 'goey-toast'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

import { requestLinkedInPublish } from './awardLinkedInApi'
import { useAwardLinkedInDraft } from './useAwardLinkedInDraft'

interface UseAwardLinkedInPublishArgs {
  award: AwardFormState | null
  categoryName: string
  isOpen: boolean
}

export function useAwardLinkedInPublish({
  award,
  categoryName,
  isOpen,
}: UseAwardLinkedInPublishArgs) {
  const draft = useAwardLinkedInDraft({ award, categoryName, isOpen })
  const [isPublishing, setIsPublishing] = useState(false)

  const publish = useCallback(
    async (args: { imageAltText: string; onSuccess?: () => void }) => {
      const text = draft.commentary.trim()
      const img = draft.coverUrl?.trim()
      if (!text) {
        gooeyToast.error('Post text is empty.', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3000 },
        })
        return false
      }
      if (!img) {
        gooeyToast.error('Cover image is missing.', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3000 },
        })
        return false
      }
      setIsPublishing(true)
      try {
        const { ok, data } = await requestLinkedInPublish(
          text,
          img,
          args.imageAltText,
        )
        if (!ok) {
          gooeyToast.error(data.error ?? 'Failed to publish to LinkedIn', {
            bounce: 0.45,
            borderColor: '#E0E0E0',
            borderWidth: 2,
            timing: { displayDuration: 4500 },
          })
          return false
        }
        args.onSuccess?.()
        return true
      } catch {
        gooeyToast.error('Failed to publish to LinkedIn', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3500 },
        })
        return false
      } finally {
        setIsPublishing(false)
      }
    },
    [draft.commentary, draft.coverUrl],
  )

  const isBusy =
    draft.isBootstrapping ||
    draft.isGeneratingCover ||
    draft.isGeneratingPost ||
    isPublishing

  return {
    ...draft,
    isPublishing,
    isBusy,
    publish,
  }
}
