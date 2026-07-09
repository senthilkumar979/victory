'use client'

import { useUser } from '@clerk/nextjs'

export function useIsAdmin(): boolean {
  const { user } = useUser()
  const meta = user?.publicMetadata as Record<string, unknown> | undefined
  return meta?.role === 'admin' || meta?.isAdmin === true
}
