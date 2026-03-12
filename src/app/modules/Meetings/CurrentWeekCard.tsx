'use client'

import { motion } from 'framer-motion'
import { Calendar, ChevronRight, Coffee, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'
import { MeetingDetailsDrawer } from '@/app/modules/Meetings/MeetingDetailsDrawer'
import { useMeetingsForWeek, type WeekDay } from '@/hooks/useMeetingsForWeek'
import { formatTime } from '@/utils/meetingUtils'

const AUTO_ROTATE_INTERVAL_MS = 3000

const getTodayKey = (): string => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Kolkata',
  })
}

interface CurrentWeekCardProps {
  onMeetingClick?: (meeting: MeetingFormState) => void
}

export const CurrentWeekCard = ({ onMeetingClick }: CurrentWeekCardProps) => {
  const { weekDays, meetingsByDay, isLoading, error } = useMeetingsForWeek()
  const todayKey = getTodayKey()
  const initialIndex = weekDays.findIndex((d) => d.key === todayKey)
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex >= 0 ? initialIndex : 0,
  )
  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingFormState | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const selectedDay = weekDays[selectedIndex]
  const events = selectedDay ? meetingsByDay[selectedDay.key] ?? [] : []

  const handleSelectDay = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  useEffect(() => {
    const idx = weekDays.findIndex((d) => d.key === todayKey)
    if (idx >= 0) setSelectedIndex(idx)
  }, [weekDays, todayKey])

  useEffect(() => {
    const id = setInterval(() => {
      setSelectedIndex((i) => (i + 1) % 7)
    }, AUTO_ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  const handleEventClick = (meeting: MeetingFormState) => {
    setSelectedMeeting(meeting)
    setIsDrawerOpen(true)
    onMeetingClick?.(meeting)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedMeeting(null)
  }

  const monthLabel =
    selectedDay?.date.toLocaleDateString('en-IN', {
      month: 'long',
      timeZone: 'Asia/Kolkata',
    }) ?? ''
  const weekRangeLabel =
    weekDays[0] && weekDays[6]
      ? `${weekDays[0].label} – ${weekDays[6].label}`
      : ''

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-2xl border border-slate-200/60 bg-slate-50/50 p-6">
        <div className="mb-4 h-6 w-48 rounded bg-slate-200" />
        <div className="mb-4 flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-10 flex-1 rounded-lg bg-slate-200" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-16 rounded-lg bg-slate-100" />
          <div className="h-16 rounded-lg bg-slate-100" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  if (weekDays.length === 0) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-blue-500/30 bg-secondary bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent shadow-xl"
      >
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {monthLabel} ({weekRangeLabel})
          </h2>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-thin">
          {weekDays.map((day, idx) => (
            <DayPill
              key={day.key}
              day={day}
              isSelected={idx === selectedIndex}
              isToday={day.key === todayKey}
              onClick={() => handleSelectDay(idx)}
            />
          ))}
        </div>

        <div className="min-h-[200px] px-6 pb-6">
          {events.length === 0 ? (
            <NoEventsMessage selectedDay={selectedDay} />
          ) : (
            <ul className="space-y-3 pt-2">
              {events.map((meeting) => (
                <EventListItem
                  key={meeting.id}
                  meeting={meeting}
                  onClick={() => handleEventClick(meeting)}
                />
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      <MeetingDetailsDrawer
        meeting={selectedMeeting}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </>
  )
}

interface DayPillProps {
  day: WeekDay
  isSelected: boolean
  isToday: boolean
  onClick: () => void
}

const DayPill = ({ day, isSelected, isToday, onClick }: DayPillProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all
      ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : 'bg-white/10 text-slate-300 hover:bg-white/20'}
      ${isToday && !isSelected ? 'ring-1 ring-primary/50' : ''}
    `}
  >
    {day.label}
  </button>
)

interface EventListItemProps {
  meeting: MeetingFormState
  onClick: () => void
}

const EventListItem = ({ meeting, onClick }: EventListItemProps) => (
  <motion.li
    initial={{ opacity: 0, x: -8 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex cursor-pointer items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition-colors hover:bg-white/10 hover:border-primary/30"
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => e.key === 'Enter' && onClick()}
  >
    <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
      <Calendar className="size-6" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-medium text-white truncate">
        {meeting.title || 'Untitled meeting'}
      </p>
      <p className="text-sm text-slate-400">{formatTime(meeting.date)} IST</p>
    </div>
    <ChevronRight className="size-5 shrink-0 text-slate-500" />
  </motion.li>
)

interface NoEventsMessageProps {
  selectedDay: WeekDay | undefined
}

const NoEventsMessage = ({ selectedDay }: NoEventsMessageProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/5 py-4 px-6 text-center">
    <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-slate-500/20">
      <Sparkles className="size-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-semibold text-slate-300">
      No events on {selectedDay?.label ?? 'this day'}
    </h3>
    <p className="mt-2 max-w-sm text-sm text-slate-500">
      Take a breather, grab a coffee, or catch up on something you’ve been
      putting off. Something great might be just around the corner.
    </p>
    <div className="mt-6 flex items-center gap-2 rounded-full bg-slate-500/10 px-4 py-2 text-sm text-slate-500">
      <Coffee className="size-4" />
      <span>Perfect time for a break</span>
    </div>
  </div>
)
