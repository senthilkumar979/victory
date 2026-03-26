'use client'

import { useEffect, useState } from 'react'

import { gooeyToast } from 'goey-toast'

import { useMeetings } from '@/hooks/useMeetings'

import { AttendanceTrackerDrawer } from './AttendanceTrackerDrawer'
import { DeleteMeeting } from './DeleteMeeting'
import type { MeetingFormState } from './Meeting.types'
import { MeetingCoverImageDrawer } from './MeetingCoverImageDrawer'
import { MeetingFormDrawer } from './MeetingFormDrawer'
import { MeetingsHeader } from './MeetingsHeader'
import { MeetingsListStates } from './MeetingsListStates'
import { MeetingsTable } from './MeetingsTable'

export const AdminMeetings = () => {
  const { meetings, isLoading, error, refetch } = useMeetings()
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [formState, setFormState] = useState<MeetingFormState | undefined>(
    undefined,
  )
  const [
    meetingToDelete,
    setMeetingToDelete,
  ] = useState<MeetingFormState | null>(null)
  const [
    attendanceMeeting,
    setAttendanceMeeting,
  ] = useState<MeetingFormState | null>(null)
  const [sendingFeedbackEmailId, setSendingFeedbackEmailId] = useState<
    string | null
  >(null)
  const [creatingFeedbackFormId, setCreatingFeedbackFormId] = useState<
    string | null
  >(null)
  const [isCoverDrawerOpen, setIsCoverDrawerOpen] = useState(false)
  const [coverMeeting, setCoverMeeting] = useState<MeetingFormState | null>(
    null,
  )
  const [pendingCoverMeetingId, setPendingCoverMeetingId] = useState<
    string | null
  >(null)

  const handleOpenCreate = () => {
    setFormState(undefined)
    setIsFormDrawerOpen(true)
  }

  const handleOpenEdit = (meeting: MeetingFormState) => {
    setFormState({
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      googleGroupId: meeting.googleGroupId,
      description: meeting.description,
      meetingLink: meeting.meetingLink,
      coverImageUrl: meeting.coverImageUrl,
    })
    setIsFormDrawerOpen(true)
  }

  const handleFormSuccess = async (detail?: {
    meetingId?: string
    suggestCoverImage?: boolean
  }) => {
    setIsFormDrawerOpen(false)
    setFormState(undefined)
    if (detail?.meetingId && detail.suggestCoverImage) {
      setPendingCoverMeetingId(detail.meetingId)
    }
    await refetch()
  }

  useEffect(() => {
    if (!pendingCoverMeetingId) return
    const m = meetings.find((x) => x.id === pendingCoverMeetingId)
    if (!m) return
    setCoverMeeting(m)
    setIsCoverDrawerOpen(true)
    setPendingCoverMeetingId(null)
  }, [meetings, pendingCoverMeetingId])

  const handleCloseDrawer = () => {
    setIsFormDrawerOpen(false)
    setFormState(undefined)
  }

  const handleOpenDelete = (meeting: MeetingFormState) => {
    setMeetingToDelete(meeting)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteClose = () => {
    setIsDeleteModalOpen(false)
    setMeetingToDelete(null)
  }

  const handleDeleted = () => {
    handleDeleteClose()
    refetch()
  }

  const handleOpenMeeting = (meeting: MeetingFormState) => {
    window.open(meeting.meetingLink, '_blank')
  }

  const handleOpenFeedback = (meeting: MeetingFormState) => {
    window.open(meeting.feedbackForm, '_blank')
  }

  const handleOpenAttendance = (meeting: MeetingFormState) => {
    setAttendanceMeeting(meeting)
  }

  const handleSendFeedbackEmail = async (
    meeting: MeetingFormState,
    forceResend = false,
  ) => {
    if (!meeting.id) return
    setSendingFeedbackEmailId(meeting.id)
    try {
      const res = await fetch(
        `/api/meetings/${encodeURIComponent(meeting.id)}/send-feedback-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ forceResend }),
        },
      )
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
      }
      if (!res.ok) {
        gooeyToast.error(data.error ?? 'Failed to send feedback email', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3500 },
        })
        return
      }
      gooeyToast.success('Feedback email sent to the Google Group.', {
        description: meeting.title,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2500 },
      })
      await refetch()
    } catch {
      gooeyToast.error('Failed to send feedback email', {
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3500 },
      })
    } finally {
      setSendingFeedbackEmailId(null)
    }
  }

  const handleCreateFeedbackForm = async (meeting: MeetingFormState) => {
    if (!meeting.id) return
    setCreatingFeedbackFormId(meeting.id)
    try {
      const res = await fetch('/api/meetings/create-feedback-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        feedbackFormUrl?: string
      }
      if (!res.ok) {
        gooeyToast.error(data.error ?? 'Failed to create feedback form', {
          bounce: 0.45,
          borderColor: '#E0E0E0',
          borderWidth: 2,
          timing: { displayDuration: 3500 },
        })
        return
      }
      gooeyToast.success('Feedback form created.', {
        description: meeting.title,
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 2500 },
      })
      await refetch()
    } catch {
      gooeyToast.error('Failed to create feedback form', {
        bounce: 0.45,
        borderColor: '#E0E0E0',
        borderWidth: 2,
        timing: { displayDuration: 3500 },
      })
    } finally {
      setCreatingFeedbackFormId(null)
    }
  }

  const handleCloseAttendance = () => {
    setAttendanceMeeting(null)
  }

  const handleGenerateCoverImage = (meeting: MeetingFormState) => {
    if (!meeting.id) return
    setCoverMeeting(meeting)
    setIsCoverDrawerOpen(true)
  }

  const handleCloseCoverDrawer = () => {
    setIsCoverDrawerOpen(false)
    setCoverMeeting(null)
  }

  const showStates = isLoading || error || meetings.length === 0
  const showTable = !isLoading && !error && meetings.length > 0

  return (
    <div className="relative">
      <div className="min-h-[500px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-2 py-2">
        <div className="px-3 py-3">
          <MeetingsHeader onAddMeeting={handleOpenCreate} />

          {showStates && (
            <MeetingsListStates
              isLoading={isLoading}
              error={error}
              isEmpty={meetings.length === 0}
            />
          )}

          {showTable && (
            <MeetingsTable
              meetings={meetings}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onAttendance={handleOpenAttendance}
              onSendFeedbackEmail={handleSendFeedbackEmail}
              onCreateFeedbackForm={handleCreateFeedbackForm}
              openMeeting={handleOpenMeeting}
              openFeedback={handleOpenFeedback}
              onGenerateCoverImage={handleGenerateCoverImage}
              sendingFeedbackEmailId={sendingFeedbackEmailId}
              creatingFeedbackFormId={creatingFeedbackFormId}
            />
          )}
        </div>

        <MeetingFormDrawer
          isOpen={isFormDrawerOpen}
          meetingToEdit={formState}
          onClose={handleCloseDrawer}
          onSuccess={handleFormSuccess}
        />

        <MeetingCoverImageDrawer
          meeting={coverMeeting}
          isOpen={isCoverDrawerOpen}
          onClose={handleCloseCoverDrawer}
          onConfirmed={() => void refetch()}
        />

        <DeleteMeeting
          show={isDeleteModalOpen}
          meetingToDelete={meetingToDelete}
          onClose={handleDeleteClose}
          onDeleted={handleDeleted}
        />

        <AttendanceTrackerDrawer
          isOpen={Boolean(attendanceMeeting)}
          meeting={attendanceMeeting}
          onClose={handleCloseAttendance}
        />
      </div>
    </div>
  )
}
