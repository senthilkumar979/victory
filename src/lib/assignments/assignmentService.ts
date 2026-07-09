import 'server-only'

import type {
  Assignment,
  AssignmentStats,
  AssignmentSubmission,
  Cohort,
} from '@/types/assignment.types'
import { getAssignmentDueStatus } from '@/lib/assignments/assignmentUtils'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function mapAssignment(row: Record<string, unknown>): Assignment {
  const cohort = row.cohorts as { name?: string } | null
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) ?? '',
    cohortId: row.cohort_id as string,
    cohortName: cohort?.name,
    googleGroupId: row.google_group_id as string,
    attachments: (row.attachments as string | null) ?? null,
    dueDate: row.due_date as string,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function mapSubmission(row: Record<string, unknown>): AssignmentSubmission {
  const student = row.students as { name?: string; email?: string } | null
  return {
    id: row.id as string,
    assignmentId: row.assignment_id as string,
    studentId: row.student_id as string,
    studentName: student?.name,
    studentEmail: student?.email,
    googleDocUrl: row.google_doc_url as string,
    githubRepoUrl: row.github_repo_url as string,
    submittedAt: row.submitted_at as string,
    updatedAt: row.updated_at as string,
  }
}

function getDb() {
  const db = supabaseAdmin
  if (!db) throw new Error('Server database is not configured.')
  return db
}

export async function listCohorts(): Promise<Cohort[]> {
  const { data, error } = await getDb()
    .from('cohorts')
    .select('id, name')
    .order('name', { ascending: false })

  if (error) throw error
  return (data ?? []).map((r) => ({ id: r.id, name: r.name }))
}

export async function getAssignmentStats(
  assignmentId: string,
  cohortId: string,
): Promise<AssignmentStats> {
  const db = getDb()

  const [{ count: totalStudents }, { count: submittedCount }] = await Promise.all([
    db
      .from('students')
      .select('id', { count: 'exact', head: true })
      .eq('cohort_id', cohortId),
    db
      .from('assignment_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId),
  ])

  const total = totalStudents ?? 0
  const submitted = submittedCount ?? 0
  const pending = Math.max(0, total - submitted)
  const submissionPercentage =
    total > 0 ? Math.round((submitted / total) * 100) : 0

  return {
    totalStudents: total,
    submittedCount: submitted,
    pendingCount: pending,
    submissionPercentage,
  }
}

export async function listAssignmentsForAdmin(): Promise<Assignment[]> {
  const { data, error } = await getDb()
    .from('assignments')
    .select('*, cohorts(name)')
    .order('due_date', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapAssignment)
}

export async function listAssignmentsForStudent(
  cohortId: string,
): Promise<Assignment[]> {
  const { data, error } = await getDb()
    .from('assignments')
    .select('*, cohorts(name)')
    .eq('cohort_id', cohortId)
    .order('due_date', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapAssignment)
}

export async function getAssignmentById(id: string): Promise<Assignment | null> {
  const { data, error } = await getDb()
    .from('assignments')
    .select('*, cohorts(name)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapAssignment(data) : null
}

export async function createAssignment(
  payload: Omit<Assignment, 'id' | 'createdAt' | 'updatedAt' | 'cohortName'>,
): Promise<Assignment> {
  const { data, error } = await getDb()
    .from('assignments')
    .insert({
      title: payload.title,
      description: payload.description,
      cohort_id: payload.cohortId,
      google_group_id: payload.googleGroupId,
      attachments: payload.attachments || null,
      due_date: payload.dueDate,
      created_by: payload.createdBy,
    })
    .select('*, cohorts(name)')
    .single()

  if (error) throw error
  return mapAssignment(data)
}

export async function updateAssignment(
  id: string,
  payload: Partial<
    Pick<
      Assignment,
      | 'title'
      | 'description'
      | 'cohortId'
      | 'googleGroupId'
      | 'attachments'
      | 'dueDate'
    >
  >,
): Promise<Assignment> {
  const updateRow: Record<string, unknown> = {}
  if (payload.title !== undefined) updateRow.title = payload.title
  if (payload.description !== undefined) updateRow.description = payload.description
  if (payload.cohortId !== undefined) updateRow.cohort_id = payload.cohortId
  if (payload.googleGroupId !== undefined)
    updateRow.google_group_id = payload.googleGroupId
  if (payload.attachments !== undefined)
    updateRow.attachments = payload.attachments || null
  if (payload.dueDate !== undefined) updateRow.due_date = payload.dueDate

  const { data, error } = await getDb()
    .from('assignments')
    .update(updateRow)
    .eq('id', id)
    .select('*, cohorts(name)')
    .single()

  if (error) throw error
  return mapAssignment(data)
}

export async function deleteAssignment(id: string): Promise<void> {
  const { error } = await getDb().from('assignments').delete().eq('id', id)
  if (error) throw error
}

export async function listSubmissionsForAssignment(
  assignmentId: string,
): Promise<AssignmentSubmission[]> {
  const { data, error } = await getDb()
    .from('assignment_submissions')
    .select('*, students(name, email)')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapSubmission)
}

export async function getSubmissionForStudent(
  assignmentId: string,
  studentId: string,
): Promise<AssignmentSubmission | null> {
  const { data, error } = await getDb()
    .from('assignment_submissions')
    .select('*')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)
    .maybeSingle()

  if (error) throw error
  return data ? mapSubmission(data) : null
}

export async function getSubmissionById(
  submissionId: string,
): Promise<AssignmentSubmission | null> {
  const { data, error } = await getDb()
    .from('assignment_submissions')
    .select('*, students(name, email)')
    .eq('id', submissionId)
    .maybeSingle()

  if (error) throw error
  return data ? mapSubmission(data) : null
}

export async function upsertSubmission(params: {
  assignmentId: string
  studentId: string
  googleDocUrl: string
  githubRepoUrl: string
}): Promise<AssignmentSubmission> {
  const existing = await getSubmissionForStudent(
    params.assignmentId,
    params.studentId,
  )

  if (existing) {
    const { data, error } = await getDb()
      .from('assignment_submissions')
      .update({
        google_doc_url: params.googleDocUrl,
        github_repo_url: params.githubRepoUrl,
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error) throw error
    return mapSubmission(data)
  }

  const { data, error } = await getDb()
    .from('assignment_submissions')
    .insert({
      assignment_id: params.assignmentId,
      student_id: params.studentId,
      google_doc_url: params.googleDocUrl,
      github_repo_url: params.githubRepoUrl,
    })
    .select('*')
    .single()

  if (error) throw error
  return mapSubmission(data)
}

export function enrichAssignmentListItem(
  assignment: Assignment,
  stats: AssignmentStats,
  mySubmissionStatus?: 'not_submitted' | 'submitted',
) {
  return {
    ...assignment,
    stats,
    mySubmissionStatus,
    dueStatus: getAssignmentDueStatus(assignment.dueDate),
  }
}
