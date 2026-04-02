import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Keyboard } from 'lucide-react'

interface InterviewPrepProgressProps {
  index: number
  total: number
  progressPct: number
  progressBarClass: string
}

export const InterviewPrepProgress = ({
  index,
  total,
  progressPct,
  progressBarClass,
}: InterviewPrepProgressProps) => (
  <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        Progress
      </p>
      <p className="mt-1 font-mono text-2xl tabular-nums text-zinc-100">
        {index + 1}
        <span className="text-lg text-zinc-600"> / {total}</span>
      </p>
    </div>
    <div
      className="flex flex-1 flex-col gap-2 sm:max-w-md sm:pb-1"
      role="progressbar"
      aria-valuenow={index + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Question ${index + 1} of ${total}`}
    >
      <div className="h-2 overflow-hidden rounded-full bg-zinc-800/80 ring-1 ring-white/[0.06]">
        <motion.div
          className={cn('h-full rounded-full', progressBarClass)}
          initial={false}
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
        />
      </div>
      <p className="text-[11px] leading-relaxed text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Keyboard className="size-3.5 shrink-0 opacity-70" aria-hidden />
          Arrow keys to move · Space or Enter to reveal
        </span>
        <span className="mt-1 block text-zinc-600">
          On touch: swipe the card right or left
        </span>
      </p>
    </div>
  </div>
)
