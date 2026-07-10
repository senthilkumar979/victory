import { NextResponse } from 'next/server'

import { sendSubmissionFeedbackEmail } from '@/lib/assignments/assignmentEmail'
import { submissionFeedbackSchema } from '@/lib/assignments/assignmentSchemas'
import {
  getAssignmentById,
  getSubmissionById,
  updateSubmissionFeedback,
} from '@/lib/assignments/assignmentService'
import { isAdminUser } from '@/lib/auth/clerkUser'
import { requireAuth } from '@/lib/auth/requireAuth'

interface RouteContext {
  params: Promise<{ id: string; submissionId: string }>
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: assignmentId, submissionId } = await context.params

  try {
    const assignment = await getAssignmentById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    const existing = await getSubmissionById(submissionId)
    if (!existing || existing.assignmentId !== assignmentId) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = submissionFeedbackSchema.safeParse({
      ...body,
      rating: Number(body.rating),
    })
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const values = parsed.data
    const submission = await updateSubmissionFeedback(submissionId, {
      rating: values.rating,
      reviewedBy: values.reviewedBy,
      feedbackComment: values.feedbackComment,
    })

    if (submission.studentEmail) {
      await sendSubmissionFeedbackEmail({
        to: submission.studentEmail,
        studentName: submission.studentName ?? 'Student',
        assignmentTitle: assignment.title,
        rating: values.rating,
        reviewedBy: values.reviewedBy,
        feedbackComment: values.feedbackComment,
      }).catch((e) => console.error('[feedback email]', e))
    }

    return NextResponse.json({ submission })
  } catch (err) {
    console.error('[api/submissions/feedback PATCH]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not save feedback.' },
      { status: 500 },
    )
  }
}
