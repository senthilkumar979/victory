import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import { supabase } from '@/lib/supabaseClient'

type UserRole = 'user' | 'admin'

const PROFILE_PATH = '/secured/profile'
const ADMIN_SETTINGS_PATH = '/secured/admin/settings'
const SIGN_IN_PATH = '/sign-in'
const FALLBACK_PATH = '/'

const getRoleFromMetadata = (role: unknown): UserRole => {
  if (role === 'admin') return 'admin'
  return 'user'
}

const getRedirectPathForRole = (role: UserRole): string => {
  if (role === 'admin') return ADMIN_SETTINGS_PATH
  return PROFILE_PATH
}

const getPrimaryEmail = (user: NonNullable<Awaited<ReturnType<typeof currentUser>>>): string | null => {
  const primary = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)
  return primary?.emailAddress ?? user.emailAddresses[0]?.emailAddress ?? null
}

const isUserInStudentsTable = async (email: string): Promise<boolean> => {
  const { data, error } = await supabase.from('students').select('id').eq('email', email).maybeSingle()
  if (error) {
    console.error('Error checking students table:', error)
    return false
  }
  return data != null
}

export async function GET() {
  const user = await currentUser()

  if (!user) {
    return NextResponse.redirect(new URL(SIGN_IN_PATH, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'), 307)
  }

  const email = getPrimaryEmail(user)
  if (!email) {
    return NextResponse.redirect(new URL(PROFILE_PATH, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'), 307)
  }

  const hasStudentEntry = await isUserInStudentsTable(email)
  if (!hasStudentEntry) {
    return NextResponse.redirect(new URL(PROFILE_PATH, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'), 307)
  }

  const role = getRoleFromMetadata(user.publicMetadata.role)
  const targetPath = getRedirectPathForRole(role) || FALLBACK_PATH
  return NextResponse.redirect(new URL(targetPath, process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'), 307)
}
