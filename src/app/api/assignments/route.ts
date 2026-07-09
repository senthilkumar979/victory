import { NextResponse } from 'next/server'

import { sendAssignmentNotificationEmail } from '@/lib/assignments/assignmentEmail'
import { assignmentFormSchema } from '@/lib/assignments/assignmentSchemas'
import {
  createAssignment,
  enrichAssignmentListItem,
  getAssignmentStats,
  getSubmissionForStudent,
  listAssignmentsForAdmin,
  listAssignmentsForStudent,
} from '@/lib/assignments/assignmentService'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'
import { isAdminUser } from '@/lib/auth/clerkUser'
import { getStudentForEmail, requireAuth } from '@/lib/auth/requireAuth'

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'https://mentorbridge.in'
}

export async function GET() {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  const isAdmin = isAdminUser(auth.context.user)

  try {
    if (isAdmin) {
      const assignments = await listAssignmentsForAdmin()
      const items = await Promise.all(
        assignments.map(async (a) => {
          const stats = await getAssignmentStats(a.id, a.cohortId)
          return enrichAssignmentListItem(a, stats)
        }),
      )
      return NextResponse.json({ assignments: items, isAdmin: true })
    }

    const student = await getStudentForEmail(auth.context.email)
    if (!student?.cohort_id) {
      return NextResponse.json({ assignments: [], isAdmin: false })
    }

    const assignments = await listAssignmentsForStudent(student.cohort_id)
    const items = await Promise.all(
      assignments.map(async (a) => {
        const stats = await getAssignmentStats(a.id, a.cohortId)
        const submission = await getSubmissionForStudent(a.id, student.id)
        return enrichAssignmentListItem(
          a,
          stats,
          submission ? 'submitted' : 'not_submitted',
        )
      }),
    )

    return NextResponse.json({ assignments: items, isAdmin: false })
  } catch (err) {
    console.error('[api/assignments GET]', err)
    return NextResponse.json(
      { error: 'Could not load assignments.' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if ('response' in auth) return auth.response

  if (!isAdminUser(auth.context.user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

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
    const assignment = await createAssignment({
      title: values.title,
      description: values.description,
      cohortId: values.cohortId,
      googleGroupId: values.googleGroupId,
      attachments: values.attachments || null,
      dueDate: new Date(values.dueDate).toISOString(),
      createdBy: auth.context.email,
    })

    const stats = await getAssignmentStats(assignment.id, assignment.cohortId)

    await sendAssignmentNotificationEmail({
      to: assignment.googleGroupId,
      title: assignment.title,
      description: assignment.description,
      dueDate: formatDueDate(assignment.dueDate),
      assignmentUrl: `${getBaseUrl()}/secured/assignments/${assignment.id}`,
      attachmentsUrl: assignment.attachments,
    }).catch((e) => console.error('[assignment create email]', e))

    return NextResponse.json({
      assignment: enrichAssignmentListItem(assignment, stats),
    })
  } catch (err) {
    console.error('[api/assignments POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Could not create assignment.' },
      { status: 500 },
    )
  }
}
