import { useCallback, useEffect, useRef, useState } from 'react'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

import {
  requestAwardCoverGenerate,
  requestAwardLinkedInBootstrapDeduped,
  requestAwardPostGenerate,
} from './awardLinkedInApi'

interface Args {
  award: AwardFormState | null
  categoryName: string
  isOpen: boolean
}

export function useAwardLinkedInDraft({
  award,
  categoryName,
  isOpen,
}: Args) {
  const awardRef = useRef(award)
  awardRef.current = award

  const [coverPrompt, setCoverPrompt] = useState('')
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [previewPathname, setPreviewPathname] = useState<string | null>(null)
  const [commentary, setCommentary] = useState('')
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [isGeneratingCover, setIsGeneratingCover] = useState(false)
  const [isGeneratingPost, setIsGeneratingPost] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setCoverPrompt('')
    setCoverUrl(null)
    setPreviewPathname(null)
    setCommentary('')
    setGenerateError(null)
    setIsBootstrapping(false)
    setIsGeneratingCover(false)
    setIsGeneratingPost(false)
  }, [])

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  useEffect(() => {
    if (!isOpen || !award?.id) return
    const a = awardRef.current
    if (!a?.id) return

    let dismissed = false
    setIsBootstrapping(true)
    setGenerateError(null)

    void requestAwardLinkedInBootstrapDeduped(a.id, a, categoryName)
      .then(({ cover, post }) => {
        if (dismissed) return
        if (!cover.ok) {
          setGenerateError(cover.data.error ?? 'Failed to generate cover image')
          return
        }
        if (!post.ok) {
          setGenerateError(post.data.error ?? 'Failed to generate post text')
          return
        }
        if (cover.data.promptUsed) setCoverPrompt(cover.data.promptUsed)
        setCoverUrl(cover.data.previewUrl ?? null)
        setPreviewPathname(cover.data.previewPathname ?? null)
        if (post.data.commentary) setCommentary(post.data.commentary)
      })
      .catch(() => {
        if (!dismissed) setGenerateError('Failed to load LinkedIn draft')
      })
      .finally(() => {
        if (!dismissed) setIsBootstrapping(false)
      })

    return () => {
      dismissed = true
    }
  }, [isOpen, award?.id, categoryName])

  const regenerateCover = useCallback(async () => {
    const a = awardRef.current
    if (!a?.id) return
    setIsGeneratingCover(true)
    setGenerateError(null)
    try {
      const { ok, data } = await requestAwardCoverGenerate(a.id, {
        userPrompt: coverPrompt.trim() || undefined,
        replacePreviewPathname: previewPathname ?? undefined,
      })
      if (!ok) {
        setGenerateError(data.error ?? 'Failed to regenerate cover')
        return
      }
      if (data.promptUsed) setCoverPrompt(data.promptUsed)
      setCoverUrl(data.previewUrl ?? null)
      setPreviewPathname(data.previewPathname ?? null)
    } catch {
      setGenerateError('Failed to regenerate cover image')
    } finally {
      setIsGeneratingCover(false)
    }
  }, [coverPrompt, previewPathname])

  const regeneratePost = useCallback(async () => {
    const a = awardRef.current
    if (!a?.id) return
    setIsGeneratingPost(true)
    setGenerateError(null)
    try {
      const { ok, data } = await requestAwardPostGenerate(a, categoryName)
      if (!ok) {
        setGenerateError(data.error ?? 'Failed to regenerate post')
        return
      }
      if (data.commentary) setCommentary(data.commentary)
    } catch {
      setGenerateError('Failed to regenerate post text')
    } finally {
      setIsGeneratingPost(false)
    }
  }, [categoryName])

  return {
    coverPrompt,
    setCoverPrompt,
    coverUrl,
    commentary,
    setCommentary,
    isBootstrapping,
    isGeneratingCover,
    isGeneratingPost,
    generateError,
    regenerateCover,
    regeneratePost,
  }
}
