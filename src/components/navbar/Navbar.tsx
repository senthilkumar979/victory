'use client'

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from 'framer-motion'
import { GooeyToaster } from 'goey-toast'
import 'goey-toast/styles.css'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { NavItem } from './NavItem'
import { NavbarBrand } from './NavbarBrand'
import { NavbarDesktopActions } from './NavbarDesktopActions'
import { NavbarMobilePanel } from './NavbarMobilePanel'
import { NAV_MAIN } from './navConfig'

export const Navbar = () => {
  const pathname = usePathname() ?? ''
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduceMotion = useReducedMotion()
  const reduce = Boolean(reduceMotion)

  const navListVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.06,
        delayChildren: reduce ? 0 : 0.06,
      },
    },
  }

  const navItemVariants = {
    hidden: {
      opacity: reduce ? 1 : 0,
      y: reduce ? 0 : -14,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] as const },
    },
  }

  useEffect(() => {
    const id = requestAnimationFrame(() => setMobileOpen(false))
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

  return (
    <>
      <motion.header
        className="sticky top-0 z-50 w-full"
        initial={reduceMotion ? false : { opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        />
        <div className="relative border-b border-gray-200/80 bg-gradient-to-b from-white/85 via-white/75 to-white/65 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/55">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-80"
          />
          <div className="relative mx-auto flex h-16 max-w-9xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-5 lg:gap-8">
              <NavbarBrand />
              <LayoutGroup>
                <motion.nav
                  className="hidden min-w-0 items-center gap-1 lg:flex"
                  aria-label="Primary"
                  variants={navListVariants}
                  initial="hidden"
                  animate="show"
                >
                  {NAV_MAIN.map((item) => (
                    <motion.div key={item.href} variants={navItemVariants}>
                      <NavItem
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        pathname={pathname}
                      />
                    </motion.div>
                  ))}
                </motion.nav>
              </LayoutGroup>
            </div>

            <NavbarDesktopActions pathname={pathname} reduceMotion={reduce} />

            <motion.button
              type="button"
              className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-gray-200/90 bg-white/90 text-gray-800 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation-panel"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((o) => !o)}
              whileTap={reduceMotion ? undefined : { scale: 0.95 }}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" aria-hidden />
              ) : (
                <Menu className="h-5 w-5" aria-hidden />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen ? (
          <NavbarMobilePanel
            key="mobile-nav"
            pathname={pathname}
            onClose={() => setMobileOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <GooeyToaster position="bottom-left" />
    </>
  )
}
