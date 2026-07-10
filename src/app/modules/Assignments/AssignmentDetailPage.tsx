'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { useAssignment } from '@/hooks/useAssignment'
import { MarkdownContent } from '@/components/assignments/MarkdownContent'
import { GoogleDocPreview } from '@/components/assignments/GoogleDocPreview'
import { GitHubRepoPreview } from '@/components/assignments/GitHubRepoPreview'
import {
  DueStatusChip,
  SubmissionStatusChip,
} from '@/components/assignments/AssignmentStatusChips'
import { SubmissionsTable } from './SubmissionsTable'
import { SubmissionFormDrawer } from './SubmissionFormDrawer'
import { SubmissionFeedbackView } from '@/components/assignments/SubmissionFeedbackView'
import { formatDueDate, isPastDue } from '@/lib/assignments/assignmentUtils'
import { Button } from '@/atoms/button/Button'

interface AssignmentDetailPageProps {
  assignmentId: string
}

export const AssignmentDetailPage = ({ assignmentId }: AssignmentDetailPageProps) => {
  const {
    assignment,
    mySubmission,
    submissions,
    isAdmin,
    isLoading,
    error,
    refetch,
  } = useAssignment(assignmentId)
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false)

  if (isLoading) {
    return <p className="p-8 text-slate-400">Loading assignment...</p>
  }

  if (error || !assignment) {
    return (
      <p className="p-8 text-red-400">{error ?? 'Assignment not found.'}</p>
    )
  }

  const pastDue = isPastDue(assignment.dueDate)
  const canEditSubmission = !pastDue || isAdmin

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/secured/assignments"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to assignments
        </Link>

        <header className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <DueStatusChip status={assignment.dueStatus} />
            {!isAdmin && (
              <SubmissionStatusChip submitted={Boolean(mySubmission)} />
            )}
          </div>
          <h1 className="text-2xl font-semibold text-slate-100">{assignment.title}</h1>
          <p className="text-sm text-slate-400">
            Due {formatDueDate(assignment.dueDate)}
            {assignment.cohortName && ` · Cohort ${assignment.cohortName}`}
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
        </header>

        <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h2>
          <MarkdownContent content={assignment.description} />
        </section>

        {!isAdmin && (
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              My submission
            </h2>
            {mySubmission ? (
              <>
                <p className="text-xs text-slate-400">
                  Last updated {formatDueDate(mySubmission.updatedAt)}
                </p>
                <GoogleDocPreview url={mySubmission.googleDocUrl} />
                <GitHubRepoPreview repoUrl={mySubmission.githubRepoUrl} />
                <SubmissionFeedbackView submission={mySubmission} />
                {canEditSubmission ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsSubmissionOpen(true)}
                  >
                    Edit submission
                  </Button>
                ) : (
                  <p className="text-sm text-amber-300">
                    Submission deadline has passed.
                  </p>
                )}
              </>
            ) : pastDue ? (
              <p className="text-sm text-amber-300">
                Submission deadline has passed.
              </p>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSubmissionOpen(true)}
              >
                Submit assignment
              </Button>
            )}
          </section>
        )}

        {isAdmin && submissions && (
          <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Submissions dashboard
            </h2>
            <SubmissionsTable
              submissions={submissions}
              assignmentId={assignmentId}
              cohortStudentCount={assignment.stats.totalStudents}
            />
          </section>
        )}
      </div>

      <SubmissionFormDrawer
        isOpen={isSubmissionOpen}
        assignmentId={assignmentId}
        submission={mySubmission}
        readOnly={!canEditSubmission}
        onClose={() => setIsSubmissionOpen(false)}
        onSuccess={() => {
          setIsSubmissionOpen(false)
          refetch()
        }}
      />
    </div>
  )
}
