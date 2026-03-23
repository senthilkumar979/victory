'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { GooeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { NavbarMobileDrawer } from './NavbarMobileDrawer'
import { NavLinks } from './NavLinks'

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/' || pathname === ''
  return pathname === href || pathname.startsWith(`${href}/`)
}

export const Navbar = () => {
  const { user, isLoaded } = useUser()
  const pathname = usePathname() ?? ''
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setMobileOpen(false)
    })
    return () => cancelAnimationFrame(id)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const linkBaseClass =
    'text-sm font-medium flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-100 hover:underline-offset-4 hover:underline lg:px-1 lg:py-0 lg:hover:bg-transparent'

  const activeClass = (href: string) =>
    isNavActive(pathname, href)
      ? 'text-primary font-semibold bg-primary/10 lg:bg-transparent'
      : 'text-slate-700 hover:text-primary'

  if (!isLoaded) {
    return null
  }

  const userName = user?.fullName

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex min-h-[3.25rem] max-w-[100vw] items-center justify-between gap-2 px-3 py-2 sm:min-h-[3.5rem] sm:gap-3 sm:px-4 md:px-6">
          <div className="min-w-0 flex-shrink">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="https://91qunajyvl11yxyb.public.blob.vercel-storage.com/long-logo"
                alt="MentorBridge"
                width={120}
                height={60}
                className="h-7 w-auto sm:h-9 lg:h-10"
                priority
              />
            </Link>
          </div>

          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <div className="flex max-w-full items-center gap-2 overflow-x-auto overflow-y-hidden py-1 [scrollbar-width:thin] xl:gap-3">
              <NavLinks
                linkBaseClass={linkBaseClass}
                activeClass={activeClass}
              />
            </div>
          </div>

          {userName && (
            <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
              <span
                className="hidden max-w-[100px] truncate text-xs font-medium text-slate-700 sm:max-w-[140px] sm:text-sm md:inline md:max-w-[180px] lg:max-w-[220px]"
                title={userName ?? undefined}
              >
                {userName}
              </span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'size-9 sm:size-10',
                    userButtonPopoverCard: 'w-64',
                    userButtonPopoverFooter:
                      'flex items-center justify-between',
                  },
                }}
              />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 lg:hidden"
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden />
                )}
              </button>
            </div>
          )}
        </div>
      </nav>

      {mobileOpen ? (
        <NavbarMobileDrawer
          linkBaseClass={linkBaseClass}
          activeClass={activeClass}
          onNavigate={() => setMobileOpen(false)}
          onDismiss={() => setMobileOpen(false)}
        />
      ) : null}

      <GooeyToaster position="bottom-left" />
    </>
  )
}
