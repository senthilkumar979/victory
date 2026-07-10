'use client'

import Link from 'next/link'
import { AlertCircle, ClipboardList } from 'lucide-react'

import type { AssignmentListItem } from '@/types/assignment.types'
import { hasSubmissionFeedback } from '@/components/assignments/SubmissionRatingDisplay'
import {
  DueStatusChip,
  SubmissionStatusChip,
} from '@/components/assignments/AssignmentStatusChips'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'

interface MemberDashboardActionItemsProps {
  assignments: AssignmentListItem[]
  isLoading: boolean
}

export const MemberDashboardActionItems = ({
  assignments,
  isLoading,
}: MemberDashboardActionItemsProps) => {
  if (isLoading) {
    return (
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" aria-hidden />
    )
  }

  const dueSoon = assignments.filter((a) => a.dueStatus === 'due_soon')
  const pastDue = assignments.filter(
    (a) => a.dueStatus === 'past_due' && a.mySubmissionStatus !== 'submitted',
  )
  const needsSubmit = assignments.filter(
    (a) => a.mySubmissionStatus !== 'submitted' && a.dueStatus !== 'past_due',
  )

  const items = [
    dueSoon.length > 0 && {
      label: `${dueSoon.length} assignment${dueSoon.length === 1 ? '' : 's'} due soon`,
      href: '/secured/assignments',
    },
    pastDue.length > 0 && {
      label: `${pastDue.length} past due — not submitted`,
      href: '/secured/assignments',
    },
    needsSubmit.length > 0 && {
      label: `${needsSubmit.length} open assignment${needsSubmit.length === 1 ? '' : 's'} to submit`,
      href: '/secured/assignments',
    },
  ].filter(Boolean) as { label: string; href: string }[]

  if (items.length === 0) return null

  return (
    <section
      className="rounded-2xl border border-amber-200/80 bg-amber-50/90 p-5 shadow-sm"
      aria-labelledby="dashboard-action-items"
    >
      <div className="mb-3 flex items-center gap-2">
        <AlertCircle className="size-5 text-amber-600" aria-hidden />
        <h2 id="dashboard-action-items" className="font-semibold text-amber-950">
          Action items
        </h2>
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href} className="text-sm font-medium text-amber-900 hover:underline">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

interface MemberDashboardAssignmentsSectionProps {
  assignments: AssignmentListItem[]
  isLoading: boolean
  error: string | null
}

export const MemberDashboardAssignmentsSection = ({
  assignments,
  isLoading,
  error,
}: MemberDashboardAssignmentsSectionProps) => {
  const urgent = [...assignments]
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
      aria-labelledby="dashboard-assignments-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-5 text-primary" aria-hidden />
          <h2 id="dashboard-assignments-heading" className="text-lg font-semibold text-slate-900">
            Assignments
          </h2>
        </div>
        <Link href="/secured/assignments" className="text-sm font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {isLoading && <div className="h-32 animate-pulse rounded-xl bg-slate-100" />}
      {error && !isLoading && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {!isLoading && !error && urgent.length === 0 && (
        <p className="text-sm text-slate-500">No assignments for your cohort yet.</p>
      )}
      {!isLoading && !error && urgent.length > 0 && (
        <ul className="space-y-3">
          {urgent.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/secured/assignments/${a.id}`}
                  className="font-medium text-slate-900 hover:text-primary"
                >
                  {a.title}
                </Link>
                <DueStatusChip status={a.dueStatus} />
                {a.mySubmissionStatus && (
                  <SubmissionStatusChip
                    submitted={a.mySubmissionStatus === 'submitted'}
                  />
                )}
              </div>
              <p className="mt-1 text-xs text-slate-500">Due {formatDueDate(a.dueDate)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
