import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import type {
  ModalBodyProps,
  ModalComposition,
  ModalFooterProps,
  ModalRootProps,
  ModalSize,
  ModalTitleProps,
} from './Modal.types'

const sizeClassMap: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

const ModalRoot = ({
  isOpen,
  children,
  onClose,
  size = 'md',
  showCloseButton = true,
}: ModalRootProps) => {
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

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }

  const modalSizeClass = sizeClassMap[size]

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-slate-950/80 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          onClick={handleBackdropClick}
        >
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className={`relative mx-4 w-full ${modalSizeClass} outline-none`}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleContainerClick}
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/30 via-sky-500/20 to-violet-500/30 p-px shadow-[0_0_0_1px_rgba(148,163,184,0.2)]">
              <div className="relative flex flex-col gap-4 rounded-2xl bg-slate-950/90 p-5 sm:p-6">
                <div className="pointer-events-none absolute -left-24 top-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 -bottom-16 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />

                {showCloseButton ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="group absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700/70 bg-slate-900/80 text-slate-300 transition-colors hover:border-primary/60 hover:bg-primary/20 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950"
                    aria-label="Close modal"
                  >
                    <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-sky-500/40 to-violet-500/40 opacity-0 blur group-hover:opacity-30" />
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
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

const ModalTitle = ({ children }: ModalTitleProps) => (
  <header className="relative flex items-start justify-between gap-4 pr-8">
    <div className="flex flex-col gap-1.5">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-primary/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(34,197,94,0.25)]" />
        <span>{children}</span>
      </div>
    </div>
  </header>
)

const ModalBody = ({ children }: ModalBodyProps) => (
  <main className="relative max-h-[60vh] space-y-3 overflow-y-auto pr-1 text-sm leading-relaxed text-slate-200 sm:text-[0.95rem]">
    {children}
  </main>
)

const ModalFooter = ({ children }: ModalFooterProps) => (
  <footer className="relative mt-1 flex flex-col gap-2 border-t border-slate-800/70 pt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
    <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500"></span>
    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
      {children}
    </div>
  </footer>
)

export const Modal = Object.assign(ModalRoot, {
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
}) as ModalComposition
