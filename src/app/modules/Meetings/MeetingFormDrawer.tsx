'use client'

import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

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
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: toFormValues(null),
  })

  useEffect(() => {
    if (!isOpen) return
    form.reset(toFormValues(meetingToEdit ?? null))
  }, [isOpen, meetingToEdit, form])

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

    let meetLinkFailed = false
    try {
      if (isEditing && meetingToEdit?.id) {
        await updateMeeting(meetingToEdit.id, payload)
      } else {
        const { id } = await createMeeting(payload)
        const meetRes = await fetch('/api/meetings/create-google-meet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: payload.title,
            date: payload.date,
            description: payload.description || undefined,
            attendees: payload.googleGroupId
              ? [payload.googleGroupId]
              : ['mentorbridgeindia@gmail.com'],
          }),
        })
        if (meetRes.ok) {
          const { meetingLink: link } = (await meetRes.json()) as {
            meetingLink: string
          }
          if (link) {
            await updateMeeting(id, { ...payload, meetingLink: link })
          }
        } else {
          meetLinkFailed = true
        }
      }
      gooeyToast.success(
        meetLinkFailed
          ? 'Meeting saved. Google Meet link could not be created—add it manually if needed.'
          : 'Meeting saved successfully.',
        {
          description: <span>{payload.title}</span>,
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: meetLinkFailed ? 4000 : 2000 },
        },
      )
      onSuccess()
    } catch (err) {
      gooeyToast.error('Failed to save meeting.', {
        description: err instanceof Error ? err.message : 'Please try again.',
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3000 },
      })
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
          <MeetingFormFields formId="meeting-form" form={form} />
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
