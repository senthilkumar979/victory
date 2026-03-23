'use client'

import { SignOutButton, UserButton } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

import type { NavUserItem } from './navConfig'

export interface UserAccountDropdownProps {
  menuId: string
  links: NavUserItem[]
  onClose: () => void
  reduceMotion: boolean
}

const transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }

export const UserAccountDropdown = memo(
  ({ menuId, links, onClose, reduceMotion }: UserAccountDropdownProps) => (
    <motion.div
      id={menuId}
      role="menu"
      aria-label="Account"
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
      transition={transition}
      className="absolute right-0 top-full z-50 mt-3 min-w-[13.5rem] origin-top-right overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 py-2 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.18)] backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />
      {links.map((item) => {
        const ItemIcon = item.icon
        return (
          <Link
            key={item.href}
            role="menuitem"
            href={item.href}
            className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent hover:text-gray-950 focus-visible:bg-gray-50 focus-visible:outline-none"
            onClick={onClose}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
              <ItemIcon className="h-4 w-4" aria-hidden strokeWidth={2} />
            </span>
            {item.label}
          </Link>
        )
      })}
      <div
        className="mx-2 my-1.5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"
        role="presentation"
      />
      <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
        <button
          type="button"
          role="menuitem"
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-red-50/80 hover:text-red-700 focus-visible:bg-red-50 focus-visible:outline-none"
          onClick={onClose}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <LogOut className="h-4 w-4" aria-hidden strokeWidth={2} />
          </span>
          Logout
        </button>
      </SignOutButton>
    </motion.div>
  ),
)

UserAccountDropdown.displayName = 'UserAccountDropdown'
