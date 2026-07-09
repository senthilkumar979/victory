'use client'

import { useState } from 'react'

import { MarkdownContent } from '@/components/assignments/MarkdownContent'
import { joinClassNames } from '@/utils/tailwindUtils'

interface MarkdownEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
}

export const MarkdownEditor = ({
  id,
  value,
  onChange,
  error,
}: MarkdownEditorProps) => {
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  return (
    <div>
      <div className="mb-2 flex gap-2">
        {(['write', 'preview'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={joinClassNames(
              'rounded-md px-3 py-1 text-xs font-medium capitalize',
              tab === t
                ? 'bg-primary/20 text-primary'
                : 'text-slate-400 hover:text-slate-200',
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'write' ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder="Write assignment description in Markdown..."
          className={joinClassNames(
            'block w-full rounded-md border px-3 py-2 text-sm font-mono',
            'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            error && 'border-red-500',
          )}
        />
      ) : (
        <div className="min-h-[12rem] rounded-md border border-slate-700 bg-slate-900/50 p-3">
          <MarkdownContent content={value || '_Nothing to preview_'} />
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
}
