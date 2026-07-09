import { NextResponse } from 'next/server'

import { sendAssignmentNotificationEmail } from '@/lib/assignments/assignmentEmail'
import { assignmentFormSchema } from '@/lib/assignments/assignmentSchemas'
import {
  deleteAssignment,
  enrichAssignmentListItem,
  getAssignmentById,
  getAssignmentStats,
  getSubmissionForStudent,
  listSubmissionsForAssignment,
  updateAssignment,
} from '@/lib/assignments/assignmentService'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'
import { isAdminUser } from '@/lib/auth/clerkUser'
import { getStudentForEmail, requireAuth } from '@/lib/auth/requireAuth'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://mentorbridge.in'
}

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const { id } = await context.params
  const isAdmin = isAdminUser(auth.context.user)

  try {
    const assignment = await getAssignmentById(id)
    if (!assignment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!isAdmin) {
      const student = await getStudentForEmail(auth.context.email)
      if (!student?.cohort_id || student.cohort_id !== assignment.cohortId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const stats = await getAssignmentStats(assignment.id, assignment.cohortId)
    let mySubmission = null
    if (!isAdmin) {
      const student = await getStudentForEmail(auth.context.email)
      if (student?.id) {
        mySubmission = await getSubmissionForStudent(id, student.id)
      }
    }

    const submissions = isAdmin
      ? await listSubmissionsForAssignment(id)
      : undefined

    return NextResponse.json({
      assignment: enrichAssignmentListItem(assignment, stats),
      mySubmission,
      submissions,
      isAdmin,
    })
  } catch (err) {
    console.error('[api/assignments/[id] GET]', err)
    return NextResponse.json(
      { error: 'Could not load assignment.' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params

  try {
    const body = await request.json()
    const parsed = assignmentFormSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const values = parsed.data
    const assignment = await updateAssignment(id, {
      title: values.title,
      description: values.description,
      cohortId: values.cohortId,
      googleGroupId: values.googleGroupId,
      attachments: values.attachments || null,
      dueDate: new Date(values.dueDate).toISOString(),
    })

    const stats = await getAssignmentStats(assignment.id, assignment.cohortId)

    await sendAssignmentNotificationEmail({
      to: assignment.googleGroupId,
      title: `[Updated] ${assignment.title}`,
      description: assignment.description,
      dueDate: formatDueDate(assignment.dueDate),
      assignmentUrl: `${getBaseUrl()}/secured/assignments/${assignment.id}`,
      attachmentsUrl: assignment.attachments,
    }).catch((e) => console.error('[assignment update email]', e))

    return NextResponse.json({
      assignment: enrichAssignmentListItem(assignment, stats),
    })
  } catch (err) {
    console.error('[api/assignments/[id] PATCH]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not update assignment.' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await context.params

  try {
    await deleteAssignment(id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[api/assignments/[id] DELETE]', err)
    return NextResponse.json(
      { error: 'Could not delete assignment.' },
      { status: 500 },
    )
  }
}
