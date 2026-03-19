'use client'

import { Badge } from '@/atoms/badge/Badge'
import { Button } from '@/atoms/button/Button'
import type { RoadmapNodeMeta } from '@/data/roadmaps'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, CheckCircle, X, XCircle } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { DrawerResources } from './DrawerResources'

interface NodeDrawerProps {
  node: RoadmapNodeMeta | null
  isCompleted: boolean
  onClose: () => void
  onComplete: (id: string) => void
  onIncomplete: (id: string) => void
}

export const NodeDrawer = ({
  node,
  isCompleted,
  onClose,
  onComplete,
  onIncomplete,
}: NodeDrawerProps) => {
  useEffect(() => {
    if (!node) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [node, onClose])

  if (typeof document === 'undefined') return null

  const backdropTransition = { duration: 0.3, ease: 'easeOut' as const }
  const drawerTransition = {
    type: 'tween' as const,
    duration: 0.3,
    ease: [0.16, 1, 0.3, 1] as const,
  }

  return createPortal(
    <AnimatePresence mode="wait">
      {node ? (
        <motion.div
          key={node.id}
          className="fixed inset-0 z-50 flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={backdropTransition}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={`drawer-title-${node.id}`}
            className="fixed right-0 top-0 z-[51] flex h-[calc(100%-1rem)] w-full max-w-[440px] flex-col border-l border-muted bg-secondary shadow-xl ml-2 mr-2 mt-2 mb-2 rounded-lg"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={drawerTransition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="flex shrink-0 items-start justify-between gap-3 border-b border-muted px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2
                      id={`drawer-title-${node.id}`}
                      className="text-xl font-semibold tracking-tight text-foreground border-l-2 pl-2 border-primary"
                    >
                      {node.title}
                    </h2>
                    {isCompleted && (
                      <Badge size="sm" color="success">
                        <CheckCircle className="size-4" /> Done
                      </Badge>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close drawer"
                >
                  <X className="size-5" />
                </button>
              </header>

              <main className="flex-1 overflow-y-auto px-6 py-5">
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {node.description}
                </p>
                {node.resources.length > 0 && (
                  <DrawerResources resources={node.resources} />
                )}
              </main>

              <footer className="flex shrink-0 gap-3 border-t border-muted px-6 py-4 justify-between">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Close
                </Button>
                {!isCompleted ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onComplete(node.id)}
                    className="gap-2"
                  >
                    <Check className="size-4" /> Mark Complete
                  </Button>
                ) : (
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => onIncomplete(node.id)}
                    className="gap-2"
                  >
                    <XCircle className="size-4" /> Mark Incomplete
                  </Button>
                )}
              </footer>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
