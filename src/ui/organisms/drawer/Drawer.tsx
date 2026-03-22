import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import type {
  DrawerBodyProps,
  DrawerComposition,
  DrawerFooterProps,
  DrawerRootProps,
  DrawerSize,
  DrawerTitleProps,
} from './Drawer.types'

const sizeClassMap: Record<DrawerSize, string> = {
  sm: 'max-w-xs',
  md: 'max-w-sm',
  lg: 'max-w-md',
  xl: 'max-w-lg',
  xxl: 'max-w-2xl',
  xxxl: 'max-w-3xl',
}

const DrawerRoot = ({
  isOpen,
  onClose,
  children,
  side = 'right',
  size = 'md',
  showCloseButton = true,
}: DrawerRootProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    if (containerRef.current) containerRef.current.focus()

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleBackdropClick = () => {
    onClose()
  }

  const drawerSizeClass = sizeClassMap[size]
  const isRight = side === 'right'
  const slideInitial = { x: isRight ? 24 : -24 }
  const slideExit = { x: isRight ? 16 : -16 }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {/* Dedicated backdrop: only this layer closes on overlay click. */}
          <div
            role="presentation"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xl"
            onClick={handleBackdropClick}
            aria-hidden
          />
          {/* Pass-through outside the panel so clicks hit the backdrop, not a full-width row. */}
          <div
            className={`relative z-10 flex h-[calc(100%-10px)] w-full pointer-events-none ${
              isRight ? 'justify-end' : 'justify-start'
            }`}
          >
            <motion.aside
              ref={containerRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              className={`pointer-events-auto relative flex h-[full-100px] w-full ${drawerSizeClass} outline-none`}
              initial={{ opacity: 0, ...slideInitial, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, ...slideExit, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="relative flex h-[full-100px] w-full overflow-hidden rounded-md right-3 top-3 mb-3 bg-gradient-to-br from-primary/30 via-sky-500/20 to-violet-500/30 p-px shadow-[0_0_0_1px_rgba(148,163,184,0.35)] dark:from-primary/40 dark:via-sky-500/25 dark:to-violet-500/35">
                <div className="relative flex h-[full-100px]  w-full flex-col gap-4 rounded-md bg-slate-950/95 p-5 sm:p-6">
                  <div className="pointer-events-none absolute inset-y-0 -left-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />

                  {showCloseButton ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onClose()
                      }}
                      className="group absolute right-4 top-4 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/90 text-slate-300 transition-colors hover:border-primary/60 hover:bg-primary/25 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
                      aria-label="Close drawer"
                    >
                      <span
                        className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-sky-500/40 to-violet-500/40 opacity-0 blur group-hover:opacity-40"
                        aria-hidden
                      />
                      <span className="relative">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M4.5 4.5L11.5 11.5M11.5 4.5L4.5 11.5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </button>
                  ) : null}

                  {children}
                </div>
              </div>
            </motion.aside>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

const DrawerTitle = ({ children, description }: DrawerTitleProps) => (
  <header className="relative flex flex-col gap-1.5 pr-8">
    <h2 className="text-sm font-semibold tracking-tight text-slate-50 sm:text-base font-['Urbanist',system-ui,sans-serif] tracking-wide border-l-2 border-primary pl-2">
      {children}
    </h2>
    {description ? (
      <p className="text-xs text-slate-400 sm:text-[13px]">{description}</p>
    ) : null}
  </header>
)

const DrawerBody = ({ children }: DrawerBodyProps) => (
  <main className="relative mt-3 flex-1 space-y-3 overflow-y-auto pr-1 text-sm leading-relaxed text-slate-200 sm:text-[0.95rem]">
    {children}
  </main>
)

const DrawerFooter = ({ children }: DrawerFooterProps) => (
  <footer className="relative mt-3 flex flex-col gap-2 border-t border-slate-800/80 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500" />
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      {children}
    </div>
  </footer>
)

export const Drawer = Object.assign(DrawerRoot, {
  Title: DrawerTitle,
  Body: DrawerBody,
  Footer: DrawerFooter,
}) as DrawerComposition
