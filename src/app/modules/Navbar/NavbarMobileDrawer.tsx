'use client'

import { X } from 'lucide-react'
import Link from 'next/link'

import { NAV_LINKS } from './navbarLinks'

interface NavbarMobileDrawerProps {
  linkBaseClass: string
  activeClass: (href: string) => string
  onNavigate: () => void
  onDismiss: () => void
}

export const NavbarMobileDrawer = ({
  linkBaseClass,
  activeClass,
  onNavigate,
  onDismiss,
}: NavbarMobileDrawerProps) => (
  <div className="fixed inset-0 z-[60] lg:hidden" id="mobile-nav">
    <div
      role="presentation"
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      onClick={onDismiss}
      aria-hidden
    />
    <div
      className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl"
      style={{
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
      }}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-900">Menu</span>
        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close menu"
          onClick={onDismiss}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto overscroll-contain px-3 py-3"
        aria-label="Mobile"
      >
        {NAV_LINKS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`${linkBaseClass} ${activeClass(href)}`}
            onClick={onNavigate}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  </div>
)
