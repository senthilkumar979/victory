'use client'

import { cn } from '@/lib/utils'
import { BookOpen, Code2 } from 'lucide-react'

export type InterviewPrepTabId = 'questions' | 'coding'

interface InterviewPrepNavTabsProps {
  value: InterviewPrepTabId
  onChange: (next: InterviewPrepTabId) => void
  className?: string
}

const tabs: {
  id: InterviewPrepTabId
  label: string
  description: string
  icon: typeof BookOpen
}[] = [
  {
    id: 'questions',
    label: 'Questions',
    description: 'Curated Q&A cards',
    icon: BookOpen,
  },
  {
    id: 'coding',
    label: 'Exercises',
    description: 'Hands-on scenarios',
    icon: Code2,
  },
]

export const InterviewPrepNavTabs = ({
  value,
  onChange,
  className,
}: InterviewPrepNavTabsProps) => (
  <div
    className={cn(
      'rounded-2xl border border-white/[0.08] bg-zinc-950/50 p-1.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-md',
      className,
    )}
    role="tablist"
    aria-label="Interview prep sections"
  >
    <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-row">
      {tabs.map(({ id, label, description, icon: Icon }) => {
        const selected = value === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            id={`interview-prep-tab-${id}`}
            aria-selected={selected}
            aria-controls={`interview-prep-panel-${id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(id)}
            className={cn(
              'flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200',
              selected
                ? 'bg-gradient-to-br from-white/[0.12] to-white/[0.04] text-white shadow-lg ring-1 ring-white/10'
                : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300',
            )}
          >
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-lg border',
                selected
                  ? 'border-primary/30 bg-primary/15 text-primary'
                  : 'border-white/10 bg-zinc-900/60 text-zinc-500',
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold tracking-tight">
                {label}
              </span>
              <span className="mt-0.5 block text-xs font-medium text-zinc-500 hidden md:block">
                {description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  </div>
)
