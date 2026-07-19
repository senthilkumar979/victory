import 'server-only'

import { toSupabasePayload } from '@/hooks/useUpdateStudent'
import type { ProfileUpdatePayload } from '@/hooks/useUpdateStudent'
import { mapSupabaseStudentRowToProfile } from '@/lib/mapSupabaseStudentRowToProfile'
import {
  getMobileDb,
  MobileServiceError,
  paginationMeta,
} from '@/lib/mobile/mobileApiUtils'
import { getStudentSelectColumns } from '@/lib/studentSelectColumns'
import type { ProfileData } from '@/types/student.types'

const LIST_SELECT =
  'id, name, picture, role, company, email, social_links, batch, cohort_id, gender'

export interface StudentListFilters {
  search?: string
  cohort?: string
  company?: string
  role?: string
  page?: number
  limit?: number
}

export async function listStudents(filters: StudentListFilters = {}) {
  const db = getMobileDb()
  const page = filters.page ?? 1
  const limit = filters.limit ?? 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = db
    .from('students')
    .select(LIST_SELECT, { count: 'exact' })
    .order('batch', { ascending: false })
    .order('name', { ascending: true })

  if (filters.search?.trim()) {
    query = query.ilike('name', `%${filters.search.trim()}%`)
  }
  if (filters.cohort) {
    const { data: cohort } = await db
      .from('cohorts')
      .select('id, name')
      .eq('id', filters.cohort)
      .maybeSingle()
    if (cohort?.name) {
      query = query.or(
        `cohort_id.eq.${filters.cohort},batch.eq.${cohort.name}`,
      )
    } else {
      query = query.eq('cohort_id', filters.cohort)
    }
  }
  if (filters.company) query = query.eq('company', filters.company)
  if (filters.role) query = query.eq('role', filters.role)

  const { data, error, count } = await query.range(from, to)
  if (error) {
    console.error('[mobile/studentService.list]', error)
    throw new MobileServiceError(
      'Could not load students.',
      500,
      'INTERNAL_ERROR',
    )
  }

  const students = (data ?? []).map((row) =>
    mapSupabaseStudentRowToProfile(row as unknown as Record<string, unknown>),
  )

  return {
    data: students,
    pagination: paginationMeta(page, limit, count ?? students.length),
  }
}

export async function getStudentFilterOptions() {
  const db = getMobileDb()

  const [cohortsRes, studentsRes] = await Promise.all([
    db.from('cohorts').select('id, name').order('name', { ascending: true }),
    db.from('students').select('company, role'),
  ])

  if (cohortsRes.error) {
    console.error('[mobile/studentService.filterOptions]', cohortsRes.error)
    throw new MobileServiceError(
      'Could not load filter options.',
      500,
      'INTERNAL_ERROR',
    )
  }

  const companies = new Set<string>()
  const roles = new Set<string>()
  for (const row of studentsRes.data ?? []) {
    if (row.company) companies.add(String(row.company))
    if (row.role) roles.add(String(row.role))
  }

  return {
    cohorts: cohortsRes.data ?? [],
    companies: Array.from(companies).sort(),
    roles: Array.from(roles).sort(),
  }
}

export async function getStudentById(id: string): Promise<ProfileData> {
  const db = getMobileDb()
  const { data, error } = await db
    .from('students')
    .select(getStudentSelectColumns(true))
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[mobile/studentService.get]', error)
    throw new MobileServiceError(
      'Could not load student.',
      500,
      'INTERNAL_ERROR',
    )
  }
  if (!data) {
    throw new MobileServiceError('Student not found', 404, 'NOT_FOUND')
  }

  return mapSupabaseStudentRowToProfile(
    data as unknown as Record<string, unknown>,
  )
}

export async function updateStudent(
  id: string,
  payload: ProfileUpdatePayload,
) {
  const db = getMobileDb()
  payload.id = id.trim()

  const { data, error } = await db
    .from('students')
    .update(toSupabasePayload(payload))
    .eq('id', id)
    .select(getStudentSelectColumns(true))
    .maybeSingle()

  if (error) {
    console.error('[mobile/studentService.update]', error)
    throw new MobileServiceError(
      'Could not update student.',
      500,
      'INTERNAL_ERROR',
    )
  }
  if (!data) {
    throw new MobileServiceError('Student not found', 404, 'NOT_FOUND')
  }

  return mapSupabaseStudentRowToProfile(
    data as unknown as Record<string, unknown>,
  )
}

export async function getStudentAwards(studentId: string) {
  const db = getMobileDb()
  const { data, error } = await db
    .from('awards')
    .select('id, title, year, category_id, student_id, created_at')
    .eq('student_id', studentId)
    .order('year', { ascending: false })

  if (error) {
    console.error('[mobile/studentService.awards]', error)
    throw new MobileServiceError(
      'Could not load student awards.',
      500,
      'INTERNAL_ERROR',
    )
  }

  return data ?? []
}

export async function getStudentRoadmapProgress(studentId: string) {
  const db = getMobileDb()
  const { data, error } = await db
    .from('roadmap_completions')
    .select('*')
    .eq('student_id', studentId)

  if (error) {
    console.error('[mobile/studentService.roadmap]', error)
    throw new MobileServiceError(
      'Could not load roadmap progress.',
      500,
      'INTERNAL_ERROR',
    )
  }

  return data ?? []
}
