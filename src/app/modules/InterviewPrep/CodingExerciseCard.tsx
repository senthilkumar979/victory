'use client'

import { Button } from '@/components/ui/button'
import type { CodingExercise } from '@/data/interview-prep'
import { cn } from '@/lib/utils'
import { Lightbulb, ListChecks, RotateCcw } from 'lucide-react'
import { useCallback, useId, useState } from 'react'
import { codingDifficultyMeta } from './codingExerciseDifficulty'
import { CodingExerciseSolutionReveal } from './CodingExerciseSolutionReveal'

interface CodingExerciseCardProps {
  exercise: CodingExercise
  className?: string
}

export const CodingExerciseCard = ({
  exercise,
  className,
}: CodingExerciseCardProps) => {
  const panelId = useId()
  const [hintsShown, setHintsShown] = useState(0)
  const meta = codingDifficultyMeta(exercise.difficulty)

  const revealHint = useCallback(() => {
    setHintsShown((n) => Math.min(n + 1, exercise.hints.length))
  }, [exercise.hints.length])

  const resetHints = useCallback(() => setHintsShown(0), [])

  return (
    <article
      className={cn(
        'overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/35 shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/[0.05] backdrop-blur-xl',
        className,
      )}
    >
      <div
        className={cn('h-1 w-full bg-gradient-to-r', meta.bar)}
        aria-hidden
      />
      <div className="space-y-6 p-6 sm:p-8">
        <header className="space-y-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white',
              meta.chip,
            )}
          >
            {meta.label}
          </span>
          <h3 className="uppercase text-xl font-bold tracking-wider  text-white sm:text-2xl">
            {exercise.title}
          </h3>
        </header>

        <div className="space-y-3 rounded-2xl border border-white/[0.06] bg-black/20 p-5">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            <ListChecks className="size-3.5 text-primary" aria-hidden />
            Scenario
          </p>
          <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-300">
            {exercise.scenario}
          </div>
          {exercise.constraints && exercise.constraints.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-sm text-zinc-400">
              {exercise.constraints.map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary/80" />
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-amber-500/30 bg-amber-500/5 text-amber-200 hover:bg-amber-500/15 hover:text-amber-100"
            onClick={revealHint}
            disabled={hintsShown >= exercise.hints.length}
          >
            <Lightbulb className="size-4" aria-hidden />
            {hintsShown >= exercise.hints.length
              ? 'All hints shown'
              : hintsShown === 0
              ? 'Show a hint'
              : 'Show next hint'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-zinc-200"
            onClick={resetHints}
            disabled={hintsShown === 0}
          >
            <RotateCcw className="size-4" aria-hidden />
            Reset hints
          </Button>
        </div>

        {hintsShown > 0 && (
          <ul
            className="space-y-3 rounded-2xl border border-amber-500/15 bg-amber-500/[0.06] p-4 items-center"
            aria-live="polite"
          >
            {exercise.hints.slice(0, hintsShown).map((h, i) => (
              <li
                key={i}
                className="flex gap-3 text-sm leading-relaxed text-amber-100/95 items-center"
              >
                <span className="font-mono text-xs text-amber-400/90">
                  {i + 1}.
                </span>
                {h}
              </li>
            ))}
          </ul>
        )}

        <CodingExerciseSolutionReveal
          files={exercise.answerFiles}
          panelId={panelId}
        />
      </div>
    </article>
  )
}
