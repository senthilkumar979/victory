import { describe, expect, it } from 'vitest'
import { Home, Shield, User } from 'lucide-react'

import {
  NAV_USER,
  filterUserNavLinks,
  isNavActive,
  type NavUserItem,
} from './navConfig'

const guestItem: NavUserItem = {
  href: '/public',
  label: 'Public',
  icon: Home,
}

const memberItem: NavUserItem = {
  href: '/secured/profile',
  label: 'Profile',
  icon: User,
  checkAccess: true,
}

const adminItem: NavUserItem = {
  href: '/secured/admin',
  label: 'Administration',
  icon: Shield,
  checkAccess: true,
  isAdminCheck: true,
}

describe('isNavActive', () => {
  it('treats the home href as an exact match only', () => {
    expect(isNavActive('/', '/')).toBe(true)
    expect(isNavActive('', '/')).toBe(true)
    expect(isNavActive('/students', '/')).toBe(false)
  })

  it('matches nested paths without prefixing sibling routes', () => {
    expect(isNavActive('/secured/admin', '/secured/admin')).toBe(true)
    expect(isNavActive('/secured/admin/students', '/secured/admin')).toBe(true)
    expect(isNavActive('/secured/administration', '/secured/admin')).toBe(false)
  })
})

describe('filterUserNavLinks', () => {
  const items = [guestItem, memberItem, adminItem]

  it('hides signed-in and admin-only links from guests', () => {
    expect(filterUserNavLinks(items, false, false)).toEqual([guestItem])
    expect(filterUserNavLinks(NAV_USER, false, false)).toEqual([])
  })

  it('hides admin-only links from signed-in non-admins', () => {
    expect(filterUserNavLinks(items, true, false)).toEqual([
      guestItem,
      memberItem,
    ])
    expect(
      filterUserNavLinks(NAV_USER, true, false).map((item) => item.href),
    ).not.toContain('/secured/admin')
  })

  it('keeps admin links only when the user is an admin', () => {
    expect(filterUserNavLinks(items, true, true)).toEqual(items)
    expect(
      filterUserNavLinks(NAV_USER, true, true).map((item) => item.href),
    ).toContain('/secured/admin')
  })
})
