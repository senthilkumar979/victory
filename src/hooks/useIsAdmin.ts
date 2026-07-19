'use client'

import { useUser } from '@clerk/nextjs'

function isTruthyAdminFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

export function useIsAdmin(): boolean {
  const { user } = useUser()
  const meta = user?.publicMetadata as Record<string, unknown> | undefined
  if (!meta) return false

  const role = meta.role
  const roleIsAdmin =
    typeof role === 'string' && role.trim().toLowerCase() === 'admin'

  return roleIsAdmin || isTruthyAdminFlag(meta.isAdmin)
}
