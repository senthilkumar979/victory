import 'server-only'

import { NextResponse } from 'next/server'

import {
  getCurrentUser,
  getPrimaryEmail,
  isAdminUser,
  type ClerkUser,
} from '@/lib/auth/clerkUser'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export interface AuthContext {
  user: ClerkUser
  email: string
}

export interface StudentContext extends AuthContext {
  studentId: string
  cohortId: string | null
}

export async function requireAuth():
  Promise<{ context: AuthContext } | { response: NextResponse }> {
  const user = await getCurrentUser()
  if (!user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  const email = getPrimaryEmail(user)
  if (!email) {
    return {
      response: NextResponse.json(
        { error: 'No email on account' },
        { status: 403 },
      ),
    }
  }

  return { context: { user, email } }
}

export async function requireAdmin():
  Promise<{ context: AuthContext } | { response: NextResponse }> {
  const authResult = await requireAuth()
  if ('response' in authResult) return authResult

  if (!isAdminUser(authResult.context.user)) {
    return {
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return authResult
}

export async function requireStudent():
  Promise<{ context: StudentContext } | { response: NextResponse }> {
  const authResult = await requireAuth()
  if ('response' in authResult) return authResult

  const db = supabaseAdmin
  if (!db) {
    return {
      response: NextResponse.json(
        { error: 'Server database is not configured.' },
        { status: 503 },
      ),
    }
  }

  const { data: student, error } = await db
    .from('students')
    .select('id, cohort_id')
    .eq('email', authResult.context.email)
    .maybeSingle()

  if (error) {
    console.error('[requireStudent]', error)
    return {
      response: NextResponse.json(
        { error: 'Could not load student profile.' },
        { status: 500 },
      ),
    }
  }

  if (!student?.id) {
    return {
      response: NextResponse.json(
        { error: 'Student profile required.' },
        { status: 403 },
      ),
    }
  }

  return {
    context: {
      ...authResult.context,
      studentId: student.id,
      cohortId: student.cohort_id ?? null,
    },
  }
}

export async function getStudentForEmail(email: string) {
  const db = supabaseAdmin
  if (!db) return null

  const { data } = await db
    .from('students')
    .select('id, name, email, cohort_id, batch')
    .eq('email', email)
    .maybeSingle()

  return data
}
