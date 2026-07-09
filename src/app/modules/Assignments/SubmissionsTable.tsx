'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import type { AssignmentSubmission } from '@/types/assignment.types'
import { SubmissionStatusChip } from '@/components/assignments/AssignmentStatusChips'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'

interface SubmissionsTableProps {
  submissions: AssignmentSubmission[]
  assignmentId: string
  cohortStudentCount: number
}

export const SubmissionsTable = ({
  submissions,
  assignmentId,
  cohortStudentCount,
}: SubmissionsTableProps) => {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'submitted' | 'pending'>('all')

  const submittedIds = new Set(submissions.map((s) => s.studentId))

  const rows = useMemo(() => {
    const submitted = submissions.filter((s) => {
      const q = search.toLowerCase()
      const name = (s.studentName ?? '').toLowerCase()
      const email = (s.studentEmail ?? '').toLowerCase()
      return !q || name.includes(q) || email.includes(q)
    })

    if (filter === 'submitted') return submitted
    if (filter === 'pending') {
      return submitted.filter(() => false)
    }
    return submitted
  }, [submissions, search, filter])

  const submittedCount = submissions.length
  const pendingCount = Math.max(0, cohortStudentCount - submittedCount)
  const pct =
    cohortStudentCount > 0
      ? Math.round((submittedCount / cohortStudentCount) * 100)
      : 0

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total students" value={String(cohortStudentCount)} />
        <Stat label="Submitted" value={String(submittedCount)} />
        <Stat label="Pending" value={String(pendingCount)} />
        <Stat label="Submission %" value={`${pct}%`} />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="all">All submitted</option>
          <option value="submitted">Submitted only</option>
          <option value="pending">Pending only</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Student</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Submitted</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-t border-slate-800">
                <td className="px-3 py-2 text-slate-200">
                  {s.studentName ?? 'Unknown'}
                  <div className="text-xs text-slate-500">{s.studentEmail}</div>
                </td>
                <td className="px-3 py-2">
                  <SubmissionStatusChip submitted />
                </td>
                <td className="px-3 py-2 text-slate-400">
                  {formatDueDate(s.submittedAt)}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/secured/assignments/${assignmentId}/submissions/${s.id}`}
                    className="text-primary hover:underline"
                  >
                    Open submission
                  </Link>
                </td>
              </tr>
            ))}
            {filter !== 'submitted' && pendingCount > 0 && (
              <tr className="border-t border-slate-800 text-slate-500">
                <td className="px-3 py-2" colSpan={4}>
                  {pendingCount} student(s) have not submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">
        Submitted student IDs tracked: {submittedIds.size}
      </p>
    </div>
  )
}

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="text-lg font-semibold text-slate-100">{value}</p>
  </div>
)
