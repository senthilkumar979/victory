'use client'

import { SignInButton, useUser } from '@clerk/nextjs'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Image from 'next/image'
import { memo, useCallback, useEffect, useId, useRef, useState } from 'react'

import { UserAccountDropdown } from './UserAccountDropdown'
import { NAV_USER, filterUserNavLinks } from './navConfig'

export const UserMenu = memo(() => {
  const { user, isLoaded } = useUser()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const isAdmin = Boolean(user?.publicMetadata?.isAdmin)
  const links = filterUserNavLinks(NAV_USER, Boolean(user), isAdmin)
  const reduceMotion = useReducedMotion()

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  if (!isLoaded) {
    return (
      <div
        className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gradient-to-br from-gray-200 to-gray-100"
        aria-hidden
      />
    )
  }

  if (!user) {
    return (
      <SignInButton mode="modal">
        <motion.button
          type="button"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200/90 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-black/[0.04] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          whileHover={reduceMotion ? undefined : { y: -1 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          <Sparkles className="h-4 w-4 text-primary" aria-hidden strokeWidth={2} />
          Login
        </motion.button>
      </SignInButton>
    )
  }

  const initial =
    user.firstName?.[0] ?? user.emailAddresses[0]?.emailAddress?.[0] ?? '?'

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        className="relative flex cursor-pointer items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open account menu"
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/35 via-violet-400/25 to-sky-400/25 opacity-0 blur-md transition-opacity duration-300 hover:opacity-100" />
        <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-slate-900 to-slate-800 text-sm font-semibold text-white ring-2 ring-white shadow-lg shadow-slate-900/15">
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt=""
              width={40}
              height={40}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            initial.toUpperCase()
          )}
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <UserAccountDropdown
            menuId={menuId}
            links={links}
            onClose={close}
            reduceMotion={Boolean(reduceMotion)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
})

UserMenu.displayName = 'UserMenu'
