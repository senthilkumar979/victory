'use client'

import { Button } from '@/atoms/button/Button'
import type { RoadmapNodeData } from '@/data/roadmaps'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ExternalLink, X } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { Node } from 'reactflow'

interface NodeDrawerProps {
  node: Node<RoadmapNodeData> | null
  onClose: () => void
  onComplete: (node: Node<RoadmapNodeData>) => void
}

export const NodeDrawer = ({ node, onClose, onComplete }: NodeDrawerProps) => {
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
            className="fixed right-0 top-0 z-[51] flex h-full w-[400px] flex-col border-l border-muted bg-secondary p-6 shadow-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={drawerTransition}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="mb-4 flex items-start justify-between gap-4">
                <h2
                  id={`drawer-title-${node.id}`}
                  className="text-lg font-semibold text-foreground"
                >
                  {node.data.label}
                </h2>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Close drawer"
                >
                  <X className="size-5" />
                </button>
              </header>

              <main className="flex-1 overflow-y-auto pr-2">
                <p className="mb-6 text-sm text-muted-foreground">
                  {node.data.description}
                </p>

                {node.data.resources.length > 0 && (
                  <section>
                    <h3 className="mb-3 text-sm font-medium text-foreground">
                      Resources
                    </h3>
                    <ul className="space-y-2">
                      {node.data.resources.map((resource, index) => (
                        <li key={index}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-primary transition-colors hover:underline"
                          >
                            {resource.title}
                            <ExternalLink className="size-3.5 shrink-0" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </main>

              <footer className="mt-6 flex gap-3 border-t border-muted pt-4">
                <Button variant="secondary" size="sm" onClick={onClose}>
                  Close
                </Button>
                {!node.data.isCompleted && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onComplete(node)}
                    className="gap-2"
                  >
                    <Check className="size-4" /> Mark as Complete
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
