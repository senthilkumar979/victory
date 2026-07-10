'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import {
  DueStatusChip,
  SubmissionStatusChip,
} from '@/components/assignments/AssignmentStatusChips'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'
import type { AssignmentListItem } from '@/types/assignment.types'
import { Button } from '@/atoms/button/Button'

interface AssignmentCardProps {
  assignment: AssignmentListItem
  isAdmin: boolean
  onEdit?: (assignment: AssignmentListItem) => void
  onDelete?: (assignment: AssignmentListItem) => void
}

export const AssignmentCard = ({
  assignment,
  isAdmin,
  onEdit,
  onDelete,
}: AssignmentCardProps) => (
  <article className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h3 className="text-base font-semibold text-slate-100">{assignment.title}</h3>
      <div className="flex flex-wrap gap-2">
        <DueStatusChip status={assignment.dueStatus} />
        {assignment.mySubmissionStatus && (
          <SubmissionStatusChip
            submitted={assignment.mySubmissionStatus === 'submitted'}
          />
        )}
      </div>
    </div>
    <p className="text-sm text-slate-400">
      Due: {formatDueDate(assignment.dueDate)}
      {assignment.cohortName && ` · Cohort ${assignment.cohortName}`}
      {` · ${assignment.category}`}
    </p>
    <p className="text-sm text-slate-300">
      {assignment.stats.submittedCount} / {assignment.stats.totalStudents} Submitted
    </p>
    {assignment.attachments && (
      <a
        href={assignment.attachments}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        Attachments <ExternalLink className="h-3.5 w-3.5" />
      </a>
    )}
    <div className="mt-auto flex flex-wrap gap-2">
      <Link
        href={`/secured/assignments/${assignment.id}`}
        className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        Open Assignment
      </Link>
      {isAdmin && onEdit && (
        <Button variant="secondary" size="sm" onClick={() => onEdit(assignment)}>
          Edit
        </Button>
      )}
      {isAdmin && onDelete && (
        <Button variant="secondary" size="sm" onClick={() => onDelete(assignment)}>
          Delete
        </Button>
      )}
    </div>
  </article>
)
