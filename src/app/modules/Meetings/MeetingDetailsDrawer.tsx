'use client'

import { Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/atoms/button/Button'
import { Drawer } from '@/ui/organisms/drawer/Drawer'

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
