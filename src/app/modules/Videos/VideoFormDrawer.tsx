'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, XIcon } from 'lucide-react'
import { gooeyToast } from 'goey-toast'

import { Button } from '@/atoms/button/Button'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import {
  sessionVideoFormSchema,
  type SessionVideoFormValues,
} from '@/lib/sessionVideos/sessionVideoSchemas'
import { SESSION_VIDEO_CATEGORIES } from '@/lib/sessionVideos/sessionVideoCategories'
import type { SessionVideoFormState } from '@/types/sessionVideo.types'
import { VideoFormFields } from './VideoFormFields'

const toFormValues = (v: SessionVideoFormState | null): SessionVideoFormValues => ({
  title: v?.title ?? '',
  youtubeUrl: v?.youtubeUrl ?? '',
  category: v?.category ?? SESSION_VIDEO_CATEGORIES.GENERAL_SESSION,
  isFeatured: v?.isFeatured ?? false,
})

interface VideoFormDrawerProps {
  isOpen: boolean
  videoToEdit?: SessionVideoFormState
  onClose: () => void
  onSuccess: () => void
}

export const VideoFormDrawer = ({
  isOpen,
  videoToEdit,
  onClose,
  onSuccess,
}: VideoFormDrawerProps) => {
  const form = useForm<SessionVideoFormValues>({
    resolver: zodResolver(sessionVideoFormSchema),
    defaultValues: toFormValues(null),
  })
  const { reset } = form

  const formResetKey = useMemo(
    () => (!isOpen ? 'closed' : (videoToEdit?.id ?? 'create')) as string,
    [isOpen, videoToEdit?.id],
  )
  const editRef = useRef(videoToEdit)
  editRef.current = videoToEdit

  useEffect(() => {
    if (!isOpen) return
    reset(toFormValues(editRef.current ?? null))
  }, [isOpen, formResetKey, reset])

  const isEditing = Boolean(videoToEdit?.id)

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await fetch(
        isEditing ? `/api/session-videos/${videoToEdit?.id}` : '/api/session-videos',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to save')

      gooeyToast.success('Video saved successfully.')
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to save video.', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    }
  })

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="lg">
      <Drawer.Title
        description={
          isEditing ? 'Update video details.' : 'Add a cohort session video link.'
        }
      >
        {isEditing ? 'Edit video' : 'Add video'}
      </Drawer.Title>
      <Drawer.Body>
        <form id="video-form" className="space-y-4" onSubmit={handleSubmit}>
          <VideoFormFields formId="video-form" form={form} />
        </form>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" /> Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" form="video-form">
          <Check className="h-4 w-4" /> Save
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
