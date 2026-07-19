import { NextResponse } from 'next/server'

import { authenticateMobileAdmin } from '@/lib/auth/authenticateMobileRequest'
import type { ProfileUpdatePayload } from '@/hooks/useUpdateStudent'
import { mobileErrorResponse } from '@/lib/mobile/mobileApiUtils'
import { getStudentById, updateStudent } from '@/lib/mobile/studentService'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const student = await getStudentById(id)
    return NextResponse.json({ data: student })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await authenticateMobileAdmin()
  if ('error' in auth) return auth.error

  try {
    const { id } = await context.params
    const body = (await request.json()) as ProfileUpdatePayload
    if (!body.name?.trim() || !body.email?.trim() || !body.role?.trim()) {
      return NextResponse.json(
        {
          error: 'name, email, and role are required',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 },
      )
    }
    if (!body.cohortId) {
      return NextResponse.json(
        { error: 'cohortId is required', code: 'VALIDATION_ERROR' },
        { status: 400 },
      )
    }
    const student = await updateStudent(id, body)
    return NextResponse.json({ data: student })
  } catch (err) {
    return mobileErrorResponse(err)
  }
}
