'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, Compass } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { memo, useCallback, useEffect, useId, useRef, useState } from 'react'

import { ExploreDropdownMenu } from './ExploreDropdownMenu'

export const ExploreDropdown = memo(() => {
  const pathname = usePathname() ?? ''
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const exploreActive = false
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

  const panelTransition = reduceMotion
    ? { duration: 0.12 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <div ref={rootRef} className="relative">
      <motion.button
        type="button"
        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 ${
          exploreActive || open
            ? 'bg-gradient-to-b from-gray-50 to-white text-gray-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9)] ring-1 ring-gray-200/90'
            : 'text-gray-600 hover:bg-gray-100/90 hover:text-gray-950'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        whileHover={reduceMotion ? undefined : { y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      >
        <Compass
          className={`h-4 w-4 shrink-0 transition-colors ${
            exploreActive || open ? 'text-primary' : 'text-gray-500'
          }`}
          aria-hidden
          strokeWidth={2}
        />
        Explore
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <ExploreDropdownMenu
            menuId={menuId}
            pathname={pathname}
            onClose={close}
            reduceMotion={Boolean(reduceMotion)}
            panelTransition={panelTransition}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
})

ExploreDropdown.displayName = 'ExploreDropdown'
