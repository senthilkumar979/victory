import { NextResponse } from 'next/server'

import { submissionFormSchema } from '@/lib/assignments/assignmentSchemas'
import {
  getAssignmentById,
  getSubmissionForStudent,
  upsertSubmission,
} from '@/lib/assignments/assignmentService'
import { isPastDue } from '@/lib/assignments/assignmentUtils'
import { isAdminUser } from '@/lib/auth/clerkUser'
import { getStudentForEmail, requireAuth } from '@/lib/auth/requireAuth'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { id: assignmentId } = await context.params
  const isAdmin = isAdminUser(auth.context.user)

  try {
    const assignment = await getAssignmentById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const student = await getStudentForEmail(auth.context.email)
    if (!student?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!isAdmin && student.cohort_id !== assignment.cohortId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const submission = await getSubmissionForStudent(assignmentId, student.id)
    if (!submission) {
      return NextResponse.json({ submission: null })
    }

    if (!isAdmin && submission.studentId !== student.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ submission })
  } catch (err) {
    console.error('[api/assignments/my-submission GET]', err)
    return NextResponse.json(
      { error: 'Could not load submission.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { id: assignmentId } = await context.params
  const isAdmin = isAdminUser(auth.context.user)

  try {
    const assignment = await getAssignmentById(assignmentId)
    if (!assignment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const student = await getStudentForEmail(auth.context.email)
    if (!student?.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!isAdmin) {
      if (student.cohort_id !== assignment.cohortId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (isPastDue(assignment.dueDate)) {
        return NextResponse.json(
          { error: 'Submission deadline has passed.' },
          { status: 403 },
        )
      }
    }

    const body = await request.json()
    const parsed = submissionFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const targetStudentId =
      isAdmin && body.studentId ? (body.studentId as string) : student.id

    if (!isAdmin && targetStudentId !== student.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const submission = await upsertSubmission({
      assignmentId,
      studentId: targetStudentId,
      googleDocUrl: parsed.data.googleDocUrl,
      githubRepoUrl: parsed.data.githubRepoUrl,
    })

    return NextResponse.json({ submission })
  } catch (err) {
    console.error('[api/assignments/my-submission POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not save submission.' },
      { status: 500 },
    )
  }
}
