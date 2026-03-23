'use client'

import { motion } from 'framer-motion'
import { Briefcase, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { ExploreDropdown } from './ExploreDropdown'
import { UserMenu } from './UserMenu'

export interface NavbarDesktopActionsProps {
  pathname: string
  reduceMotion: boolean
}

export const NavbarDesktopActions = ({
  pathname,
  reduceMotion,
}: NavbarDesktopActionsProps) => (
  <div className="hidden shrink-0 items-center gap-2 lg:flex">
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
    >
      <Link
        href="/students"
        className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(213,63,140,0.45)] ring-1 ring-white/20 transition-[box-shadow,filter] duration-300 hover:shadow-[0_12px_28px_-6px_rgba(213,63,140,0.55)] hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        <Briefcase className="h-4 w-4 opacity-90" aria-hidden strokeWidth={2} />
        Hire Talent
        <Sparkles
          className="h-3.5 w-3.5 opacity-80"
          aria-hidden
          strokeWidth={2}
        />
      </Link>
    </motion.div>
    <UserMenu key={pathname} />
  </div>
)
