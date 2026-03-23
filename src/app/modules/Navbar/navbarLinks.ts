import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Brain,
  CalendarIcon,
  HomeIcon,
  ImageIcon,
  MapIcon,
  MedalIcon,
  Shield,
  UserIcon,
  UsersIcon,
} from 'lucide-react'

export interface NavLinkItem {
  href: string
  label: string
  icon: LucideIcon
  checkAccess?: boolean
  isAdminCheck?: boolean
}

export const NAV_LINKS: NavLinkItem[] = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/blogs', label: 'Blogs', icon: BookOpen },
  { href: '/events', label: 'Events', icon: CalendarIcon },
  { href: '/gallery', label: 'Gallery', icon: ImageIcon },
  { href: '/hall-of-fame', label: 'Hall of Fame', icon: MedalIcon },
  { href: '/roadmaps', label: 'Roadmaps', icon: MapIcon },
  { href: '/students', label: 'Students', icon: UsersIcon },
  { href: '/products', label: 'Products', icon: Brain },
  { href: '/secured/profile', label: 'Profile', icon: UserIcon, checkAccess: true },
  { href: '/secured/admin', label: 'Administration', icon: Shield, checkAccess: true, isAdminCheck: true },
]
