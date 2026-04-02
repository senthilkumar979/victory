import type { LucideIcon } from 'lucide-react'
import {
  Award,
  BookOpen,
  CalendarDays,
  Home,
  Images,
  Layers,
  Map,
  Shield,
  User,
  UserPen,
  Users
} from 'lucide-react'

export interface NavLinkItem {
  href: string
  label: string
}

export interface NavMainItem extends NavLinkItem {
  icon: LucideIcon
}

export interface ExploreSectionItem extends NavLinkItem {
  icon: LucideIcon
}

export interface NavUserItem extends NavLinkItem {
  checkAccess?: boolean
  isAdminCheck?: boolean
  icon: LucideIcon
}

export const NAV_MAIN: NavMainItem[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/events', label: 'Events', icon: CalendarDays },
  { href: '/roadmaps', label: 'Roadmaps', icon: Map },
  { href: '/products', label: 'Products', icon: Layers },
  { href: '/blogs', label: 'Blogs', icon: BookOpen },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: Award },
  { href: '/gallery', label: 'Gallery', icon: Images },
]

export const NAV_USER: NavUserItem[] = [
  { href: '/secured/profile', label: 'Profile', icon: User, checkAccess: true },
  {
    href: '/secured/admin',
    label: 'Administration',
    icon: Shield,
    checkAccess: true,
    isAdminCheck: true,
  },
  { href: '/secured/account', label: 'Account', icon: UserPen, checkAccess: true },
]

export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === ''
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function filterUserNavLinks(
  items: readonly NavUserItem[],
  hasUser: boolean,
  isAdmin: boolean,
): NavUserItem[] {
  return items.filter((item) => {
    if (item.checkAccess && !hasUser) return false
    if (item.isAdminCheck && !isAdmin) return false
    return true
  })
}
