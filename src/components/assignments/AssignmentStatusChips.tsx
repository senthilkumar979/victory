import type { AssignmentDueStatus } from '@/types/assignment.types'
import { joinClassNames } from '@/utils/tailwindUtils'

const LABELS: Record<AssignmentDueStatus, string> = {
  upcoming: 'Upcoming',
  due_soon: 'Due soon',
  past_due: 'Past due',
}

const STYLES: Record<AssignmentDueStatus, string> = {
  upcoming: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  due_soon: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  past_due: 'bg-red-500/15 text-red-300 border-red-500/30',
}

interface DueStatusChipProps {
  status: AssignmentDueStatus
  className?: string
}

export const DueStatusChip = ({ status, className }: DueStatusChipProps) => (
  <span
    className={joinClassNames(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide',
      STYLES[status],
      className,
    )}
  >
    {LABELS[status]}
  </span>
)

interface SubmissionStatusChipProps {
  submitted: boolean
}

export const SubmissionStatusChip = ({ submitted }: SubmissionStatusChipProps) => (
  <span
    className={joinClassNames(
      'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium',
      submitted
        ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-300'
        : 'border-slate-600 bg-slate-800 text-slate-400',
    )}
  >
    {submitted ? 'Submitted' : 'Not submitted'}
  </span>
)
