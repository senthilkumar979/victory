import { NextResponse } from 'next/server'

import {
  getAssignmentById,
  getSubmissionById,
} from '@/lib/assignments/assignmentService'
import { isAdminUser } from '@/lib/auth/clerkUser'
import { getStudentForEmail, requireAuth } from '@/lib/auth/requireAuth'

interface RouteContext {
  params: Promise<{ id: string; submissionId: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { id: assignmentId, submissionId } = await context.params
  const isAdmin = isAdminUser(auth.context.user)

  try {
    const assignment = await getAssignmentById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const submission = await getSubmissionById(submissionId)
    if (!submission || submission.assignmentId !== assignmentId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!isAdmin) {
      const student = await getStudentForEmail(auth.context.email)
      if (!student?.id || submission.studentId !== student.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.json({ submission, assignment })
  } catch (err) {
    console.error('[api/assignments/submission GET]', err)
    return NextResponse.json(
      { error: 'Could not load submission.' },
      { status: 500 },
    )
  }
}
