'use client'

import { useState } from 'react'

import { useMeetings } from '@/hooks/useMeetings'

import type { MeetingFormState } from './Meeting.types'
import { AttendanceTrackerDrawer } from './AttendanceTrackerDrawer'
import { DeleteMeeting } from './DeleteMeeting'
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
  const [meetingToDelete, setMeetingToDelete] =
    useState<MeetingFormState | null>(null)
  const [attendanceMeeting, setAttendanceMeeting] =
    useState<MeetingFormState | null>(null)

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

  const handleFormSuccess = () => {
    setIsFormDrawerOpen(false)
    setFormState(undefined)
    refetch()
  }

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

  const handleOpenAttendance = (meeting: MeetingFormState) => {
    setAttendanceMeeting(meeting)
  }

  const handleCloseAttendance = () => {
    setAttendanceMeeting(null)
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
            />
          )}
        </div>

        <MeetingFormDrawer
          isOpen={isFormDrawerOpen}
          meetingToEdit={formState}
          onClose={handleCloseDrawer}
          onSuccess={handleFormSuccess}
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
