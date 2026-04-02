'use client'

import { Button } from '@/components/ui/button'
import type { CodingAnswerFile } from '@/data/interview-prep'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { InterviewPrepCodePanel } from './InterviewPrepCodePanel'

interface CodingExerciseSolutionRevealProps {
  files: CodingAnswerFile[]
  panelId: string
}

export const CodingExerciseSolutionReveal = ({
  files,
  panelId,
}: CodingExerciseSolutionRevealProps) => {
  const [open, setOpen] = useState(false)
  const [fileIndex, setFileIndex] = useState(0)
  const active = files[Math.min(fileIndex, files.length - 1)]

  return (
    <div className="border-t border-white/[0.06] pt-6">
      <Button
        type="button"
        variant="outline"
        className="w-full border-violet-500/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/20 sm:w-auto"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Sparkles className="size-4" aria-hidden />
        {open ? 'Hide reference solution' : 'Reveal reference solution'}
        {open ? (
          <ChevronUp className="size-4 opacity-70" aria-hidden />
        ) : (
          <ChevronDown className="size-4 opacity-70" aria-hidden />
        )}
      </Button>

      {open && (
        <div id={panelId} className="mt-6 space-y-4">
          {files.length > 1 && (
            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Solution files"
            >
              {files.map((f, i) => (
                <button
                  key={f.path}
                  type="button"
                  role="tab"
                  aria-selected={i === fileIndex}
                  onClick={() => setFileIndex(i)}
                  className={cn(
                    'rounded-lg border px-3 py-2 font-mono text-xs transition-colors',
                    i === fileIndex
                      ? 'border-primary/40 bg-primary/15 text-primary'
                      : 'border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-white/20 hover:text-zinc-200',
                  )}
                >
                  {f.path}
                </button>
              ))}
            </div>
          )}
          <InterviewPrepCodePanel
            code={active.code}
            language={active.language}
            filePath={active.path}
          />
        </div>
      )}
    </div>
  )
}
