'use client'

import type { VisitorChatMessage } from '@/hooks/useVisitorChat'
import { renderChatRichContent } from '@/lib/renderChatRichContent'
import { cn } from '@/lib/utils'

import { VisitorAssistantMessage } from './VisitorAssistantMessage'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface VisitorChatTranscriptProps {
  messages: VisitorChatMessage[]
  hydrated: boolean
  isSending: boolean
  error: string | null
}

export const VisitorChatTranscript = ({
  messages,
  hydrated,
  isSending,
  error,
}: VisitorChatTranscriptProps) => {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hydrated) return
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending, hydrated])

  return (
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
      {!hydrated ? (
        <p className="text-sm text-slate-500" aria-live="polite">
          Loading conversation…
        </p>
      ) : null}
      {hydrated
        ? messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
              className={cn(
                'max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                m.role === 'user'
                  ? 'ml-auto bg-primary text-primary-foreground'
                  : 'mr-auto border border-slate-100 bg-slate-50 text-slate-800',
              )}
            >
              {m.role === 'assistant' ? (
                <VisitorAssistantMessage content={m.content} />
              ) : (
                <div className="whitespace-pre-wrap break-words">
                  {renderChatRichContent(m.content, { linkOnPrimary: true })}
                </div>
              )}
            </div>
          ))
        : null}
      {isSending ? (
        <div
          className="mr-auto flex max-w-[92%] items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/90 px-3 py-2.5 text-xs text-slate-600 shadow-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2
            className="h-4 w-4 shrink-0 animate-spin text-primary"
            aria-hidden
          />
          <span className="leading-snug">
            <span className="font-medium text-slate-700">Generating reply</span>
            <span className="text-slate-500"> — a moment…</span>
          </span>
        </div>
      ) : null}
      {error ? (
        <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs text-red-800">
          {error}
        </p>
      ) : null}
      <div ref={endRef} />
    </div>
  )
}
