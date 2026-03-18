'use client'

import { useCallback, useState } from 'react'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'
import { MeetingDetailsDrawer } from '@/app/modules/Meetings/MeetingDetailsDrawer'
import { useFetchParticipationsByUser } from '@/hooks/useFetchParticipationsByUser'
import { Star } from 'lucide-react'
import { AnimatedParticipations } from '../../ui/animated-testimonials'

interface ProfileParticipationsProps {
  serialNo?: number
}

export const ProfileParticipations = ({
  serialNo = 0,
}: ProfileParticipationsProps) => {
  const { participations, isLoading, error } = useFetchParticipationsByUser(
    serialNo,
  )
  const [
    selectedMeeting,
    setSelectedMeeting,
  ] = useState<MeetingFormState | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleMeetingClick = useCallback((meeting: MeetingFormState) => {
    setSelectedMeeting(meeting)
    setIsDrawerOpen(true)
  }, [])

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedMeeting(null)
  }, [])

  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        <Star className="size-4" /> Participations
      </h2>
      {isLoading && (
        <p className="py-4 text-sm text-slate-500">Loading participations…</p>
      )}
      {error && (
        <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {!isLoading &&
        !error &&
        (!participations || participations.length === 0) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Star className="size-12 text-slate-200" />
            <p className="mt-2 text-sm text-slate-500">
              No meeting participations yet
            </p>
          </div>
        )}
      {!isLoading && participations.length > 0 && (
        <AnimatedParticipations
          data={participations}
          className="space-y-2"
          cardClassName="flex w-full items-center gap-3 rounded-lg border border-slate-700/50 border-blue-500/30 bg-secondary bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent p-4 transition-all hover:border-primary/20 hover:bg-primary"
        />
      )}
      <MeetingDetailsDrawer
        meeting={selectedMeeting}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        isHideAttendance={true}
      />
    </div>
  )
}
