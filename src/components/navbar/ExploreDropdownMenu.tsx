'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { memo } from 'react'

import { EXPLORE_SECTIONS, isNavActive } from './navConfig'

export interface ExploreDropdownMenuProps {
  menuId: string
  pathname: string
  onClose: () => void
  reduceMotion: boolean
  panelTransition: { duration: number; ease?: readonly [number, number, number, number] }
}

export const ExploreDropdownMenu = memo(
  ({
    menuId,
    pathname,
    onClose,
    reduceMotion,
    panelTransition,
  }: ExploreDropdownMenuProps) => (
    <motion.div
      id={menuId}
      role="menu"
      aria-label="Explore navigation"
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.98 }}
      transition={panelTransition}
      className="absolute right-0 top-full z-50 mt-3 w-[min(24rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-gray-200/90 bg-white/95 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.8)_inset] backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
      />
      <div className="relative bg-gradient-to-br from-white via-gray-50/40 to-white p-4">
        <div className="grid grid-cols-2 gap-8">
          {EXPLORE_SECTIONS.map((section, si) => (
            <div key={section.title} role="presentation">
              <p className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                <span className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item, ii) => {
                  const itemActive = isNavActive(pathname, item.href)
                  const ItemIcon = item.icon
                  return (
                    <motion.li
                      key={item.href}
                      initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: reduceMotion ? 0 : 0.04 * (si * 2 + ii),
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      <Link
                        role="menuitem"
                        href={item.href}
                        className={`group/item flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 ${
                          itemActive
                            ? 'bg-gradient-to-r from-primary/[0.1] to-transparent font-semibold text-gray-950 ring-1 ring-primary/15'
                            : 'text-gray-700 hover:bg-white/80 hover:shadow-sm hover:ring-1 hover:ring-gray-200/80'
                        }`}
                        onClick={onClose}
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            itemActive
                              ? 'bg-primary/15 text-primary'
                              : 'bg-gray-100/90 text-gray-500 group-hover/item:bg-gray-200/90 group-hover/item:text-gray-800'
                          }`}
                        >
                          <ItemIcon className="h-4 w-4" aria-hidden strokeWidth={2} />
                        </span>
                        <span className="leading-tight">{item.label}</span>
                      </Link>
                    </motion.li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  ),
)

ExploreDropdownMenu.displayName = 'ExploreDropdownMenu'
