'use client'

import Image from 'next/image'
import { Calendar, ExternalLink, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

import { Button } from '@/atoms/button/Button'
import { Drawer } from '@/ui/organisms/drawer/Drawer'
import { useMeetingAttendance } from '@/hooks/useMeetingAttendance'
import { useStudentsBySerialNumbers } from '@/hooks/useStudentsBySerialNumbers'

import { CalendarDate } from '@/templates/CalendarDate'
import { formatDate } from '@/utils/meetingUtils'
import type { MeetingFormState } from './Meeting.types'
import { MeetingCoverImage } from './MeetingCoverImage'

interface MeetingDetailsDrawerProps {
  meeting: MeetingFormState | null
  isOpen: boolean
  onClose: () => void
}

export const MeetingDetailsDrawer = ({
  meeting,
  isOpen,
  onClose,
}: MeetingDetailsDrawerProps) => {
  const hasLink = meeting ? Boolean(meeting.meetingLink?.trim()) : false
  const { fetchAttendance } = useMeetingAttendance()
  const { students, loading, error, fetchStudents } = useStudentsBySerialNumbers()

  useEffect(() => {
    if (!isOpen) {
      fetchStudents([])
      return
    }
    if (!meeting?.id) return
    fetchAttendance(meeting.id).then((serialNos) => {
      fetchStudents(serialNos)
    })
  }, [isOpen, meeting?.id, fetchAttendance, fetchStudents])

  const hasAttendance = students.length > 0
  const showAttendanceSection = true

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size="xl">
      {meeting && (
        <>
          <Drawer.Title description={formatDate(meeting.date)}>
            <span className="text-2xl font-bold text-primary border-l-2 border-primary pl-2">
              {meeting.title || 'Untitled meeting'}
            </span>
          </Drawer.Title>

          <Drawer.Body>
            <MeetingCoverImage meeting={meeting} />

            <div className="mb-4 flex items-center gap-2 text-slate-400">
              <Calendar className="size-4" />
              <CalendarDate date={meeting.date} />
            </div>

            <div className="mt-4 border-t border-slate-200/80 pt-4">
              {meeting.description && (
                <div
                  className="prose prose-invert max-w-none prose-p:my-2 prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                  dangerouslySetInnerHTML={{ __html: meeting.description }}
                />
              )}
            </div>

            {showAttendanceSection && (
              <div className="mt-6 border-t border-slate-200/80 pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <UserCheck className="size-5 text-primary" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                    Attendance
                  </h3>
                  {!loading && (
                    <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {students.length} present
                    </span>
                  )}
                </div>
                {loading && (
                  <p className="text-sm text-slate-500">
                    Loading attendance…
                  </p>
                )}
                {error && (
                  <p className="rounded-lg border border-red-900/40 bg-red-950/30 px-3 py-2 text-sm text-red-300">
                    {error}
                  </p>
                )}
                {!loading && !error && !hasAttendance && (
                  <p className="rounded-lg border border-slate-700/50 bg-slate-800/30 px-4 py-3 text-sm text-slate-400">
                    No attendance recorded for this meeting.
                  </p>
                )}
                {!loading && hasAttendance && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {students.map((student) => (
                      <li
                        key={student.id}
                        className="flex items-center gap-3 rounded-lg border border-slate-700/50 bg-slate-800/40 px-3 py-2.5"
                      >
                        {student.picture ? (
                          <Image
                            src={student.picture}
                            alt={student.name}
                            width={36}
                            height={36}
                            className="size-9 shrink-0 rounded-full object-cover ring-1 ring-slate-600/50"
                          />
                        ) : (
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-200">
                            {student.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            {student.batch && (
                              <span>Batch {student.batch}</span>
                            )}
                            <span>#{student.serialNo}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Drawer.Body>

          <Drawer.Footer>
            {hasLink && meeting.meetingLink && (
              <Link
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="md">
                  <ExternalLink className="size-4" />
                  Join meeting
                </Button>
              </Link>
            )}
          </Drawer.Footer>
        </>
      )}
    </Drawer>
  )
}
