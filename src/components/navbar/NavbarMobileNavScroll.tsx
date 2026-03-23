'use client'

import Link from 'next/link'
import { memo } from 'react'

import {
  NAV_MAIN,
  isNavActive,
  type NavUserItem
} from './navConfig'

export interface NavbarMobileNavScrollProps {
  pathname: string
  onClose: () => void
  userLinks: NavUserItem[]
  showAccount: boolean
}

export const NavbarMobileNavScroll = memo(
  ({ pathname, onClose, userLinks, showAccount }: NavbarMobileNavScrollProps) => (
    <nav
      className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain px-3 py-4"
      aria-label="Mobile"
    >
      {NAV_MAIN.map((item) => {
        const active = isNavActive(pathname, item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base font-medium transition-colors ${
              active
                ? 'bg-gradient-to-r from-primary/10 to-transparent font-semibold text-gray-950 ring-1 ring-primary/15'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={onClose}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                active ? 'bg-primary/15 text-primary' : 'bg-gray-100 text-gray-500'
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden strokeWidth={2} />
            </span>
            {item.label}
          </Link>
        )
      })}

      <div className="my-3 border-t border-gray-100" role="presentation" />
      <Link
        href="/students"
        className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 px-3 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:brightness-105"
        onClick={onClose}
      >
        Hire Talent
      </Link>

      {showAccount ? (
        <>
          <div className="my-3 border-t border-gray-100" role="presentation" />
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
            Account
          </p>
          {userLinks.map((item) => {
            const ItemIcon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                onClick={onClose}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                  <ItemIcon className="h-5 w-5" aria-hidden strokeWidth={2} />
                </span>
                {item.label}
              </Link>
            )
          })}
        </>
      ) : null}
    </nav>
  ),
)

NavbarMobileNavScroll.displayName = 'NavbarMobileNavScroll'
