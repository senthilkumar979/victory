import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

type UserRole = 'user' | 'admin'

const PROFILE_PATH = '/secured/profile'
const ADMIN_SETTINGS_PATH = '/secured/admin/settings'
const FALLBACK_PATH = '/'

const getRoleFromMetadata = (role: unknown): UserRole => {
  if (role === 'admin') return 'admin'
  return 'user'
}

const getRedirectPathForRole = (role: UserRole): string => {
  if (role === 'admin') return ADMIN_SETTINGS_PATH
  return PROFILE_PATH
}

const PostLoginPage = async () => {
  const user = await currentUser()

  if (!user) {
    redirect('/sign-in')
  }

  const role = getRoleFromMetadata(user.publicMetadata.role)
  const targetPath = getRedirectPathForRole(role) || FALLBACK_PATH

  redirect(targetPath)
}

export default PostLoginPage
