'use client'

import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { memo } from 'react'

import { NavbarMobileNavScroll } from './NavbarMobileNavScroll'
import { NAV_USER, filterUserNavLinks } from './navConfig'

export interface NavbarMobilePanelProps {
  pathname: string
  onClose: () => void
}

export const NavbarMobilePanel = memo(
  ({ pathname, onClose }: NavbarMobilePanelProps) => {
    const { user, isLoaded } = useUser()
    const isAdmin = Boolean(user?.publicMetadata?.isAdmin)
    const userLinks = filterUserNavLinks(NAV_USER, Boolean(user), isAdmin)

    return (
      <motion.div
        className="fixed inset-0 z-[60] lg:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div
          role="presentation"
          className="absolute inset-0 bg-gray-950/40 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden
        />
        <motion.aside
          id="mobile-navigation-panel"
          className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
            paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
          }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <span className="text-sm font-semibold text-gray-900">Menu</span>
            <button
              type="button"
              className="cursor-pointer rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              aria-label="Close menu"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <NavbarMobileNavScroll
            pathname={pathname}
            onClose={onClose}
            userLinks={userLinks}
            showAccount={Boolean(isLoaded && user)}
          />

          {isLoaded && user ? (
            <div className="border-t border-gray-200 p-4">
              <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-lg border border-gray-200 py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
                  onClick={onClose}
                >
                  Logout
                </button>
              </SignOutButton>
            </div>
          ) : null}

          {isLoaded && !user ? (
            <div className="border-t border-gray-200 p-4">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="w-full cursor-pointer rounded-lg bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                  onClick={onClose}
                >
                  Login
                </button>
              </SignInButton>
            </div>
          ) : null}
        </motion.aside>
      </motion.div>
    )
  },
)

NavbarMobilePanel.displayName = 'NavbarMobilePanel'
