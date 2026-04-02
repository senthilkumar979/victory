'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface InterviewPrepQuestionJumpListProps {
  total: number
  currentIndex: number
  onJump: (index: number) => void
  /** Tighter grid and taller scroll area for sidebar beside the deck */
  compact?: boolean
  className?: string
}

export const InterviewPrepQuestionJumpList = ({
  total,
  currentIndex,
  onJump,
  compact = false,
  className,
}: InterviewPrepQuestionJumpListProps) => {
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    })
  }, [currentIndex])

  if (total < 1) return null

  return (
    <div className={cn('w-full', !compact && 'mb-6', className)}>
      <p
        id="question-jump-label"
        className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500"
      >
        Jump to question
      </p>
      <div
        aria-labelledby="question-jump-label"
        className={cn(
          'overflow-y-auto rounded-xl border border-white/[0.08] bg-zinc-950/60 p-2',
          'shadow-inner ring-1 ring-white/[0.04]',
          compact ? 'max-h-[min(90vh,56rem)]' : 'max-h-40',
        )}
      >
        <div
          className={cn(
            'grid gap-1.5',
            compact
              ? 'grid-cols-5 sm:grid-cols-6'
              : 'grid-cols-8 sm:grid-cols-10 md:grid-cols-12',
          )}
        >
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1
            const isActive = i === currentIndex
            return (
              <button
                key={n}
                ref={isActive ? activeRef : undefined}
                type="button"
                id={`question-jump-${n}`}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`Go to question ${n}`}
                className={cn(
                  'flex min-h-9 min-w-0 items-center justify-center rounded-lg font-mono text-xs tabular-nums transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
                  isActive
                    ? 'bg-primary font-semibold text-primary-foreground shadow-md shadow-primary/30'
                    : 'border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-primary/40 hover:bg-primary/10 hover:text-white',
                )}
                onClick={() => onJump(i)}
              >
                {n}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
