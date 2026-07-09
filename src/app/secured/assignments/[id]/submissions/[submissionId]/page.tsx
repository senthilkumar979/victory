'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { GoogleDocPreview } from '@/components/assignments/GoogleDocPreview'
import { GitHubRepoPreview } from '@/components/assignments/GitHubRepoPreview'
import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'
import type { AssignmentSubmission } from '@/types/assignment.types'

interface AdminSubmissionViewProps {
  assignmentId: string
  submissionId: string
}

const AdminSubmissionView = ({
  assignmentId,
  submissionId,
}: AdminSubmissionViewProps) => {
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}`)
      .then((r) => r.json())
      .then((body) => {
        if (body.error) throw new Error(body.error)
        setSubmission(body.submission)
      })
      .catch((e) => setErr(e instanceof Error ? e.message : 'Failed to load'))
  }, [assignmentId, submissionId])

  if (err) return <p className="p-8 text-red-400">{err}</p>
  if (!submission) return <p className="p-8 text-slate-400">Loading submission...</p>

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href={`/secured/assignments/${assignmentId}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to assignment
        </Link>
        <h1 className="text-xl font-semibold text-slate-100">
          {submission.studentName ?? 'Student'} submission
        </h1>
        <p className="text-sm text-slate-400">
          Updated {formatDueDate(submission.updatedAt)}
        </p>
        <GoogleDocPreview url={submission.googleDocUrl} />
        <GitHubRepoPreview repoUrl={submission.githubRepoUrl} />
      </div>
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string; submissionId: string }>
}

export default function AdminSubmissionViewPage({ params }: PageProps) {
  useCheckIsAuthenticated()
  const { id, submissionId } = use(params)
  return <AdminSubmissionView assignmentId={id} submissionId={submissionId} />
}
