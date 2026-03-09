'use client'

import { motion } from 'framer-motion'
import { Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'

import { formatDate, stripHtml } from '@/utils/meetingUtils'
import type { MeetingFormState } from './Meeting.types'
import { MeetingCoverImage } from './MeetingCoverImage'

interface MeetingCardProps {
  meeting: MeetingFormState
  onClick: () => void
}

export const MeetingCard = ({ meeting, onClick }: MeetingCardProps) => {
  const hasLink = Boolean(meeting.meetingLink?.trim())
  const descriptionText = stripHtml(meeting.description)

  return (
    <motion.article
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-blue-500/30 bg-secondary bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent p-8 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl"
    >
      {/* Cover image */}
      <div className="relative  w-full overflow-hidden  rounded-md">
        <MeetingCoverImage meeting={meeting} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
          <Calendar className="size-3.5 text-primary" />
          <time dateTime={meeting.date}>{formatDate(meeting.date)}</time>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-lg font-semibold leading-snug text-white transition-colors group-hover:text-primary">
          {meeting.title || 'Untitled meeting'}
        </h2>
        {descriptionText && (
          <p className="mt-2 line-clamp-3 text-sm text-white group-hover:text-primary">
            {descriptionText?.length && descriptionText?.length > 100
              ? descriptionText.slice(0, 100) + '...'
              : descriptionText}
          </p>
        )}

        {hasLink && (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <Link
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <ExternalLink className="size-4" />
              Join meeting
            </Link>
          </div>
        )}
      </div>
    </motion.article>
  )
}
