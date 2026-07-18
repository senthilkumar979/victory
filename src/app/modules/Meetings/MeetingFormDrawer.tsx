'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { useManageMeeting } from '@/hooks/useManageMeeting'
import { useMeetings } from '@/hooks/useMeetings'
import { toISTTimestamptz } from '@/utils/dateISTUtils'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { Check, XIcon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import type { MeetingFormDrawerProps, MeetingFormState } from './Meeting.types'
import { MeetingFormFields } from './MeetingFormFields'
import {
  meetingFormSchema,
  type MeetingFormValues,
} from './meetingFormSchema'
import { uploadMeetingCoverImage } from './useMeetingCoverImageUpload'

const toFormValues = (m: MeetingFormState | null): MeetingFormValues => ({
  title: m?.title ?? '',
  date: m?.date ? toISTTimestamptz(m.date) : '',
  googleGroupId: m?.googleGroupId ?? '',
  description: m?.description ?? '',
  meetingLink: m?.meetingLink ?? '',
  coverImageUrl: m?.coverImageUrl ?? '',
})

export const MeetingFormDrawer = ({
  isOpen,
  meetingToEdit,
  onClose,
  onSuccess,
}: MeetingFormDrawerProps) => {
  const { createMeeting, updateMeeting } = useMeetings()
  const { createMeetingWithPipeline } = useManageMeeting({
    createMeeting,
    updateMeeting,
  })
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: toFormValues(null),
  })
  const { reset } = form
  const [stagedCoverFile, setStagedCoverFile] = useState<File | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setStagedCoverFile(null)
      return
    }
    reset(toFormValues(meetingToEdit ?? null))
    setStagedCoverFile(null)
  }, [isOpen, meetingToEdit?.id, reset])

  const isEditing = useMemo(() => Boolean(meetingToEdit?.id), [
    meetingToEdit?.id,
  ])

  const handleSubmit = form.handleSubmit(async (data) => {
    const payload: Omit<MeetingFormState, 'id'> = {
      title: data.title.trim(),
      date: toISTTimestamptz(data.date.trim()),
      googleGroupId: data.googleGroupId.trim(),
      description: data.description.trim(),
      meetingLink: (data.meetingLink ?? '').trim(),
      coverImageUrl: (data.coverImageUrl ?? '').trim(),
    }

    try {
      if (isEditing && meetingToEdit?.id) {
        let coverImageUrl = payload.coverImageUrl
        if (stagedCoverFile) {
          coverImageUrl = await uploadMeetingCoverImage(
            meetingToEdit.id,
            stagedCoverFile,
          )
        }
        await updateMeeting(meetingToEdit.id, { ...payload, coverImageUrl })
        gooeyToast.success('Meeting saved successfully.', {
          description: payload.title,
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 2000 },
        })
        onSuccess({ meetingId: meetingToEdit.id })
      } else {
        const { id } = await createMeetingWithPipeline(payload)
        let hadCover = Boolean(payload.coverImageUrl)
        if (stagedCoverFile) {
          try {
            await uploadMeetingCoverImage(id, stagedCoverFile)
            hadCover = true
          } catch (uploadErr) {
            gooeyToast.warning('Meeting created but cover image upload failed.', {
              description:
                uploadErr instanceof Error
                  ? uploadErr.message
                  : 'Edit the meeting to upload a cover image.',
              bounce: 0.45,
              borderColor: '#E0E0E0',
              borderWidth: 2,
              timing: { displayDuration: 4500 },
            })
          }
        }
        onSuccess({ meetingId: id, suggestCoverImage: !hadCover })
      }
    } catch (err) {
      if (isEditing && meetingToEdit?.id) {
        gooeyToast.error('Failed to save meeting.', {
          description:
            err instanceof Error ? err.message : 'Please try again.',
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3000 },
        })
      }
    }
  })

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xxl">
      <Drawer.Title
        description={
          isEditing
            ? 'Update an existing meeting.'
            : 'Create a new meeting with date and details.'
        }
      >
        {isEditing ? 'Update meeting' : 'Create meeting'}
      </Drawer.Title>
      <Drawer.Body>
        <form
          id="meeting-form"
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <MeetingFormFields
            formId="meeting-form"
            form={form}
            meetingId={meetingToEdit?.id}
            stagedCoverFile={stagedCoverFile}
            onStagedCoverFileChange={setStagedCoverFile}
          />
        </form>
      </Drawer.Body>
      <Drawer.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          <XIcon className="h-4 w-4" /> Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" form="meeting-form">
          <Check className="h-4 w-4" /> {isEditing ? 'Update' : 'Create'}
        </Button>
      </Drawer.Footer>
    </Drawer>
  )
}
