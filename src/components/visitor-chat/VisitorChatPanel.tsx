'use client'

import { Button } from '@/components/ui/button'
import type { VisitorChatMessage } from '@/hooks/useVisitorChat'
import { cn } from '@/lib/utils'
import { Loader2, Send, X } from 'lucide-react'
import { useId } from 'react'

import { VisitorChatTranscript } from './VisitorChatTranscript'

interface VisitorChatPanelProps {
  rootId: string
  messages: VisitorChatMessage[]
  hydrated: boolean
  isSending: boolean
  error: string | null
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  onClose: () => void
}

export const VisitorChatPanel = ({
  rootId,
  messages,
  hydrated,
  isSending,
  error,
  draft,
  onDraftChange,
  onSend,
  onClose,
}: VisitorChatPanelProps) => {
  const fieldSuffix = useId()
  const titleId = `${rootId}-title-${fieldSuffix}`
  const inputId = `${rootId}-input-${fieldSuffix}`

  return (
    <div
      id={rootId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        'pointer-events-auto flex max-h-[min(70vh,32rem)] w-[min(100vw-2rem,22rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl sm:w-[24rem] md:w-[32rem] lg:w-[40rem]',
      )}
    >
      <div className="flex items-center justify-between border-b border-slate-100 bg-primary px-4 py-3 text-primary-foreground">
        <div>
          <h2 id={titleId} className="text-sm font-semibold tracking-tight">
            Ask MentorBridge
          </h2>
          <p className="text-xs text-primary-foreground/85">
            How we work, mentors, students, and more
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
            onClick={onClose}
            aria-label="Close chat"
          >
            <X className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <VisitorChatTranscript
        messages={messages}
        hydrated={hydrated}
        isSending={isSending}
        error={error}
      />

      <form
        className="border-t border-slate-100 p-3"
        onSubmit={(e) => {
          e.preventDefault()
          onSend()
        }}
      >
        <label htmlFor={inputId} className="sr-only">
          Your message
        </label>
        <div className="flex gap-2">
          <textarea
            id={inputId}
            rows={2}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSend()
              }
            }}
            placeholder="Ask a question…"
            disabled={isSending || !hydrated}
            className="min-h-[2.5rem] flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 self-end"
            disabled={isSending || !hydrated || !draft.trim()}
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
