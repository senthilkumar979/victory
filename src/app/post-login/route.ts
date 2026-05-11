import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseClient'
import { isStudentProfileCompleteRow } from '@/lib/studentProfileCompleteness'

const PROFILE_PATH = '/secured/profile'
const DASHBOARD_PATH = '/secured/dashboard'
const ADMIN_PATH = '/secured/admin'
const SIGN_IN_PATH = '/sign-in'

const getPrimaryEmail = (user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): string | null => {
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
}

const isAdminUser = (user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): boolean =>
  user.publicMetadata.role === 'admin'

export async function GET() {
  const user = await currentUser()
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://mentorbridge.in'

  if (!user) {
    return NextResponse.redirect(new URL(SIGN_IN_PATH, base), 307)
  }

  const email = getPrimaryEmail(user)
  if (!email) {
    return NextResponse.redirect(new URL(PROFILE_PATH, base), 307)
  }

  if (isAdminUser(user)) {
    return NextResponse.redirect(new URL(ADMIN_PATH, base), 307)
  }

  const { data: studentRow, error } = await supabase
    .from('students')
    .select('id, name, role, batch')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('Error loading student for post-login:', error)
    return NextResponse.redirect(new URL(PROFILE_PATH, base), 307)
  }

  if (!studentRow) {
    return NextResponse.redirect(new URL(PROFILE_PATH, base), 307)
  }

  if (!isStudentProfileCompleteRow(studentRow)) {
    return NextResponse.redirect(new URL(PROFILE_PATH, base), 307)
  }

  return NextResponse.redirect(new URL(DASHBOARD_PATH, base), 307)
}
