'use client'

import { ChevronDownIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface AwardLinkedInExpandableSectionProps {
  title: string
  toggleId: string
  panelId: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}

export const AwardLinkedInExpandableSection = ({
  title,
  toggleId,
  panelId,
  open,
  onToggle,
  children,
}: AwardLinkedInExpandableSectionProps) => (
  <div className="space-y-2 px-2">
    <button
      type="button"
      className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-700/80 bg-slate-900/40 px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      id={toggleId}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <span className="font-medium">{title}</span>
      <ChevronDownIcon
        className={cn(
          'size-4 shrink-0 text-slate-400 transition-transform',
          open && 'rotate-180',
        )}
        aria-hidden
      />
    </button>
    <div
      id={panelId}
      role="region"
      aria-labelledby={toggleId}
      className={cn('space-y-2', !open && 'hidden')}
    >
      {children}
    </div>
  </div>
)
