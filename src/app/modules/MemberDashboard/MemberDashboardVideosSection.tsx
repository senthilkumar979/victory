'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Video } from 'lucide-react'

import type { AssignmentListItem, AssignmentSubmission } from '@/types/assignment.types'
import type { SessionVideo } from '@/types/sessionVideo.types'
import { SubmissionFeedbackView } from '@/components/assignments/SubmissionFeedbackView'
import { hasSubmissionFeedback } from '@/components/assignments/SubmissionRatingDisplay'
import { getYoutubeThumbnailUrl } from '@/lib/sessionVideos/youtubeUtils'

interface MemberDashboardVideosSectionProps {
  videos: SessionVideo[]
  isLoading: boolean
  error: string | null
}

export const MemberDashboardVideosSection = ({
  videos,
  isLoading,
  error,
}: MemberDashboardVideosSectionProps) => {
  const recent = [...videos]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
      aria-labelledby="dashboard-videos-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Video className="size-5 text-primary" aria-hidden />
          <h2 id="dashboard-videos-heading" className="text-lg font-semibold text-slate-900">
            Session videos
          </h2>
        </div>
        <Link href="/secured/videos" className="text-sm font-medium text-primary hover:underline">
          Browse all
        </Link>
      </div>

      {isLoading && <div className="h-24 animate-pulse rounded-xl bg-slate-100" />}
      {error && !isLoading && <p className="text-sm text-red-600">{error}</p>}
      {!isLoading && !error && recent.length === 0 && (
        <p className="text-sm text-slate-500">No videos yet.</p>
      )}
      {!isLoading && !error && recent.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {recent.map((video) => (
            <Link
              key={video.id}
              href={`/secured/videos/${video.id}`}
              className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2 transition hover:border-primary/30"
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                <Image
                  src={getYoutubeThumbnailUrl(video.youtubeVideoId)}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <p className="line-clamp-2 text-sm font-medium text-slate-800">{video.title}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

interface MemberDashboardFeedbackSectionProps {
  assignments: AssignmentListItem[]
  submissions: Record<string, AssignmentSubmission | null>
  isLoading: boolean
}

export const MemberDashboardFeedbackSection = ({
  assignments,
  submissions,
  isLoading,
}: MemberDashboardFeedbackSectionProps) => {
  const withFeedback = assignments
    .map((a) => ({ assignment: a, submission: submissions[a.id] }))
    .filter(
      (row): row is { assignment: AssignmentListItem; submission: AssignmentSubmission } =>
        Boolean(row.submission && hasSubmissionFeedback(row.submission)),
    )
    .slice(0, 3)

  if (isLoading) {
    return <div className="h-28 animate-pulse rounded-2xl bg-slate-100" aria-hidden />
  }

  if (withFeedback.length === 0) return null

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
      aria-labelledby="dashboard-feedback-heading"
    >
      <div className="mb-4 flex items-center gap-2">
        <Star className="size-5 text-primary" aria-hidden />
        <h2 id="dashboard-feedback-heading" className="text-lg font-semibold text-slate-900">
          Recent feedback
        </h2>
      </div>
      <ul className="space-y-4">
        {withFeedback.map(({ assignment, submission }) => (
          <li key={assignment.id} className="space-y-2">
            <Link
              href={`/secured/assignments/${assignment.id}`}
              className="text-sm font-medium text-slate-900 hover:text-primary"
            >
              {assignment.title}
            </Link>
            <SubmissionFeedbackView submission={submission} />
          </li>
        ))}
      </ul>
    </section>
  )
}
