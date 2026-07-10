'use client'

import type { AssignmentSubmission } from '@/types/assignment.types'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'
import {
  SubmissionRatingDisplay,
  hasSubmissionFeedback,
} from './SubmissionRatingDisplay'

interface SubmissionFeedbackViewProps {
  submission: AssignmentSubmission
}

export const SubmissionFeedbackView = ({ submission }: SubmissionFeedbackViewProps) => {
  if (!hasSubmissionFeedback(submission) || submission.rating == null) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <h3 className="text-sm font-semibold text-slate-300">Feedback</h3>
        <p className="mt-2 text-sm text-slate-400">
          Your submission is under review. You will receive an email when feedback is ready.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3">
      <h3 className="text-sm font-semibold text-slate-200">Your feedback</h3>
      <SubmissionRatingDisplay rating={submission.rating} />
      {submission.feedbackComment && (
        <p className="text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
          {submission.feedbackComment}
        </p>
      )}
      <p className="text-xs text-slate-500">
        Reviewed by {submission.reviewedBy ?? 'Mentor'}
        {submission.reviewedAt ? ` · ${formatDueDate(submission.reviewedAt)}` : ''}
      </p>
    </div>
  )
}
