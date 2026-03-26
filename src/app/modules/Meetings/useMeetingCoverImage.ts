import { useCallback, useEffect, useState } from 'react'

import { gooeyToast } from 'goey-toast'

import type { MeetingFormState } from './Meeting.types'
import { buildDefaultMeetingCoverPrompt } from './meetingCoverPrompt'

export function useMeetingCoverImage(
  meeting: MeetingFormState | null,
  isOpen: boolean,
) {
  const [prompt, setPrompt] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewPathname, setPreviewPathname] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  useEffect(() => {
    if (!isOpen || !meeting?.id) return
    setPrompt(buildDefaultMeetingCoverPrompt(meeting))
    setPreviewUrl(null)
    setPreviewPathname(null)
  }, [isOpen, meeting])

  const generate = useCallback(async () => {
    if (!meeting?.id) return
    setIsGenerating(true)
    try {
      const res = await fetch(
        `/api/meetings/${encodeURIComponent(meeting.id)}/cover-image/generate`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userPrompt: prompt.trim(),
            replacePreviewPathname: previewPathname ?? undefined,
          }),
        },
      )
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        previewUrl?: string
        previewPathname?: string
        promptUsed?: string
      }
      if (!res.ok) {
        gooeyToast.error(data.error ?? 'Failed to generate image', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 4000 },
        })
        return
      }
      if (data.promptUsed) setPrompt(data.promptUsed)
      setPreviewUrl(data.previewUrl ?? null)
      setPreviewPathname(data.previewPathname ?? null)
    } catch {
      gooeyToast.error('Failed to generate image', {
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3500 },
      })
    } finally {
      setIsGenerating(false)
    }
  }, [meeting?.id, prompt, previewPathname])

  const confirm = useCallback(async (): Promise<
    { ok: true } | { ok: false }
  > => {
    if (!meeting?.id || !previewPathname) return { ok: false }
    setIsConfirming(true)
    try {
      const res = await fetch(
        `/api/meetings/${encodeURIComponent(meeting.id)}/cover-image/confirm`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ previewPathname }),
        },
      )
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        gooeyToast.error(data.error ?? 'Failed to save cover image', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 4000 },
        })
        return { ok: false }
      }
      gooeyToast.success('Cover image saved for this meeting.', {
        description: meeting.title,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2500 },
      })
      return { ok: true }
    } catch {
      gooeyToast.error('Failed to save cover image', {
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3500 },
      })
      return { ok: false }
    } finally {
      setIsConfirming(false)
    }
  }, [meeting?.id, meeting?.title, previewPathname])

  return {
    prompt,
    setPrompt,
    previewUrl,
    previewPathname,
    isGenerating,
    isConfirming,
    generate,
    confirm,
  }
}
