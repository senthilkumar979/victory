'use client'

import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { memo } from 'react'

import { isNavActive } from './navConfig'

const UNDERLINE_ID = 'navbar-main-underline'

export interface NavItemProps {
  href: string
  label: string
  icon: LucideIcon
  pathname: string
}

export const NavItem = memo(({ href, label, icon: Icon, pathname }: NavItemProps) => {
  const active = isNavActive(pathname, href)
  const reduceMotion = useReducedMotion()

  return (
    <Link
      href={href}
      className="group relative inline-flex cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2"
      aria-current={active ? 'page' : undefined}
    >
      <motion.span
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
          active
            ? 'bg-primary/12 text-primary shadow-[0_0_0_1px_rgba(213,63,140,0.14)]'
            : 'bg-gray-100/90 text-gray-600 group-hover:bg-gray-200/90 group-hover:text-gray-900'
        }`}
        whileHover={
          reduceMotion ? undefined : { scale: 1.05, rotate: active ? 0 : -4 }
        }
        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      >
        <Icon className="h-[15px] w-[15px]" aria-hidden strokeWidth={2} />
      </motion.span>
      <span
        className={`relative z-10 tracking-tight ${
          active ? 'font-semibold text-gray-950' : 'text-gray-600 group-hover:text-gray-950'
        }`}
      >
        {label}
      </span>
      {active ? (
        <motion.span
          layoutId={UNDERLINE_ID}
          className="pointer-events-none absolute inset-x-2 -bottom-px z-0 h-0.5 rounded-full bg-gradient-to-r from-primary via-fuchsia-500 to-violet-500 shadow-[0_0_12px_rgba(213,63,140,0.35)]"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      ) : null}
    </Link>
  )
})

NavItem.displayName = 'NavItem'
