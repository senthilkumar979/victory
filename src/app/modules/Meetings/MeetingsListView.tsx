'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Video } from 'lucide-react'

import { useMeetings } from '@/hooks/useMeetings'

import type { MeetingFormState } from './Meeting.types'
import { MeetingCard } from './MeetingCard'
import { MeetingDetailsDrawer } from './MeetingDetailsDrawer'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div
        key={i}
        className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white"
      >
        <div className="aspect-[16/10] animate-pulse bg-slate-100" />
        <div className="space-y-3 p-5">
          <div className="h-5 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="mt-4 h-9 w-28 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>
    ))}
  </div>
)

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/80 px-8 py-12 text-center">
    <AlertCircle className="mb-4 size-12 text-red-500" />
    <h3 className="text-lg font-semibold text-slate-900">Failed to load meetings</h3>
    <p className="mt-2 text-sm text-slate-600">{message}</p>
  </div>
)

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-16 text-center">
    <Video className="mb-4 size-16 text-slate-300" strokeWidth={1} />
    <h3 className="text-lg font-semibold text-slate-700">No meetings yet</h3>
    <p className="mt-2 max-w-sm text-sm text-slate-500">
      Meetings will appear here once they are scheduled.
    </p>
  </div>
)

export const MeetingsListView = () => {
  const { meetings, isLoading, error } = useMeetings()
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingFormState | null>(
    null,
  )
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleMeetingClick = (meeting: MeetingFormState) => {
    setSelectedMeeting(meeting)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedMeeting(null)
  }

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />
  if (meetings.length === 0) return <EmptyState />

  return (
    <>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {meetings.map((meeting) => (
          <motion.div key={meeting.id} variants={item}>
            <MeetingCard
              meeting={meeting}
              onClick={() => handleMeetingClick(meeting)}
            />
          </motion.div>
        ))}
      </motion.div>

      <MeetingDetailsDrawer
        meeting={selectedMeeting}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  )
}
