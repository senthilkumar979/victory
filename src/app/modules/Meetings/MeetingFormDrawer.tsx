'use client'

import { useEffect, useMemo, useState } from 'react'

import { useMeetings } from '@/hooks/useMeetings'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { gooeyToast } from 'goey-toast'
import { Check, XIcon } from 'lucide-react'

import { Button } from '@/atoms/button/Button'
import type { MeetingFormDrawerProps, MeetingFormState } from './Meeting.types'
import { MeetingFormFields } from './MeetingFormFields'

const INITIAL_STATE: MeetingFormState = {
  title: '',
  date: '',
  googleGroupId: '',
  description: '',
  meetingLink: '',
  coverImageUrl: '',
}

export const MeetingFormDrawer = ({
  isOpen,
  meetingToEdit,
  onClose,
  onSuccess,
}: MeetingFormDrawerProps) => {
  const { createMeeting, updateMeeting } = useMeetings()
  const [formState, setFormState] = useState<MeetingFormState>(INITIAL_STATE)

  // Reset form when drawer opens or when switching to a different meeting to edit
  useEffect(() => {
    if (!isOpen) return
    const next = meetingToEdit ?? INITIAL_STATE
    const id = requestAnimationFrame(() => setFormState(next))
    return () => cancelAnimationFrame(id)
  }, [isOpen, meetingToEdit])

  const isEditing = useMemo(() => Boolean(meetingToEdit?.id), [
    meetingToEdit?.id,
  ])

  const handleChange = <K extends keyof MeetingFormState>(
    field: K,
    value: MeetingFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const title = formState.title.trim()
    const date = formState.date.trim()
    if (!title || !date) return

    const payload: Omit<MeetingFormState, 'id'> = {
      title,
      date,
      googleGroupId: formState.googleGroupId.trim(),
      description: formState.description.trim(),
      meetingLink: formState.meetingLink.trim(),
      coverImageUrl: formState.coverImageUrl.trim(),
    }

    try {
      if (isEditing && formState.id) {
        await updateMeeting(formState.id, payload)
      } else {
        await createMeeting(payload)
      }
      gooeyToast.success('Meeting saved successfully.', {
        description: <span>{title}</span>,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2000 },
      })
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
  }

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
        <form id="meeting-form" className="space-y-4" onSubmit={handleSubmit}>
          <MeetingFormFields
            formId="meeting-form"
            formState={formState}
            onChange={handleChange}
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
