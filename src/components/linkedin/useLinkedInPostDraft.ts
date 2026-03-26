import { useCallback, useEffect, useState } from 'react'

import { gooeyToast } from 'goey-toast'

interface UseLinkedInPostDraftArgs {
  isOpen: boolean
  contextTitle: string
  contextDescription: string
  primaryLink: string
  contextExtra?: string
}

export function useLinkedInPostDraft({
  isOpen,
  contextTitle,
  contextDescription,
  primaryLink,
  contextExtra,
}: UseLinkedInPostDraftArgs) {
  const [commentary, setCommentary] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setCommentary('')
    setGenerateError(null)
    setIsGenerating(false)
    setIsPublishing(false)
  }, [])

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  useEffect(() => {
    if (!isOpen) return

    void (async () => {
      setIsGenerating(true)
      setGenerateError(null)
      try {
        const res = await fetch('/api/linkedin/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: contextTitle,
            description: contextDescription,
            primaryLink,
            context: contextExtra,
          }),
        })
        const data = (await res.json()) as {
          error?: string
          commentary?: string
        }
        if (!res.ok) {
          const msg =
            typeof data.error === 'string'
              ? data.error
              : 'Failed to generate post'
          setGenerateError(msg)
          gooeyToast.error(msg, {
            bounce: 0.45,
            borderColor: '#E0E0E0',
            borderWidth: 2,
            timing: { displayDuration: 4000 },
          })
          return
        }
        if (data.commentary) setCommentary(data.commentary)
      } catch {
        const msg = 'Failed to generate LinkedIn post'
        setGenerateError(msg)
        gooeyToast.error(msg, {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3500 },
        })
      } finally {
        setIsGenerating(false)
      }
    })()
  }, [
    isOpen,
    contextTitle,
    contextDescription,
    primaryLink,
    contextExtra,
  ])

  const publish = useCallback(
    async (args: {
      coverImageUrl: string
      imageAltText: string
      onSuccess?: () => void
    }) => {
      const text = commentary.trim()
      if (!text) {
        gooeyToast.error('Post text is empty.', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3000 },
        })
        return false
      }
      setIsPublishing(true)
      try {
        const res = await fetch('/api/linkedin/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commentary: text,
            imageUrl: args.coverImageUrl,
            imageAltText: args.imageAltText.slice(0, 400),
          }),
        })
        const data = (await res.json()) as { error?: string }
        if (!res.ok) {
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
    [commentary],
  )

  return {
    commentary,
    setCommentary,
    isGenerating,
    isPublishing,
    publish,
    generateError,
  }
}
