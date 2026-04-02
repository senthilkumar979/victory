'use client'

import type { CodingExercise } from '@/data/interview-prep'
import { Code2, Sparkles } from 'lucide-react'
import { CodingExerciseCard } from './CodingExerciseCard'

interface CodingExercisesSectionProps {
  trackTitle: string
  exercises: CodingExercise[]
}

export const CodingExercisesSection = ({
  trackTitle,
  exercises,
}: CodingExercisesSectionProps) => {
  if (exercises.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/[0.12] bg-zinc-950/25 px-6 py-16 text-center backdrop-blur-sm sm:px-10">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <Code2 className="size-8 text-zinc-500" aria-hidden />
        </div>
        <h3 className="mt-6 uppercase tracking-wider text-xl font-bold text-white sm:text-2xl">
          Exercises coming soon
        </h3>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-400">
          Scenario-based coding labs for{' '}
          <span className="text-zinc-200">{trackTitle}</span> are not published
          yet. JavaScript is available now—browse that track to try the full
          experience, including multi-file reference solutions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-zinc-900/40 via-zinc-950/60 to-black/40 p-6 sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-primary/10 blur-3xl"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Hands-on
            </p>
            <h2 className="mt-2 uppercase text-2xl font-bold tracking-wider text-white sm:text-3xl">
              Coding exercises
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Read the scenario, sketch your solution in the editor, reveal
              hints only when you need them, then compare against our reference
              implementation. Exercises run from beginner through mid-level.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center sm:text-left">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
              In this track
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-primary">
              {exercises.length}
            </p>
            <p className="text-xs text-zinc-500">scenarios</p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {exercises.map((ex) => (
          <CodingExerciseCard key={ex.id} exercise={ex} />
        ))}
      </div>
    </div>
  )
}
