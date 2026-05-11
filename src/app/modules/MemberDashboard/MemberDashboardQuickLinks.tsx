'use client'

import { NAV_MAIN } from '@/components/navbar/navConfig'
import { motion } from 'framer-motion'
import Link from 'next/link'

const DASHBOARD_LINK_HREFS = new Set([
  '/roadmaps',
  '/interview-prep',
  '/events',
  '/blogs',
  '/students',
])

export const MemberDashboardQuickLinks = () => {
  const links = NAV_MAIN.filter((item) => DASHBOARD_LINK_HREFS.has(item.href))

  return (
    <section
      className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm"
      aria-labelledby="member-dashboard-quicklinks-heading"
    >
      <h2
        id="member-dashboard-quicklinks-heading"
        className="mb-4 text-lg font-semibold text-slate-900"
      >
        Quick links
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-800 transition-colors hover:border-primary/30 hover:bg-white"
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                {item.label}
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
