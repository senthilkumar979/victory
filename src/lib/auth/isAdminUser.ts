function isTruthyAdminFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1'
}

/**
 * Admin if `publicMetadata.role` is admin (case-insensitive) or `isAdmin` is truthy.
 * Matches web navbar (`Boolean(publicMetadata.isAdmin)`) and `useIsAdmin`.
 */
export function isAdminUser(user: { publicMetadata?: unknown }): boolean {
  const meta = (user.publicMetadata ?? {}) as Record<string, unknown>
  const role = meta.role
  const roleIsAdmin =
    typeof role === 'string' && role.trim().toLowerCase() === 'admin'

  return roleIsAdmin || isTruthyAdminFlag(meta.isAdmin)
}
