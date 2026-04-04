'use client'

import { Button } from '@/components/ui/button'
import { useVisitorChat } from '@/hooks/useVisitorChat'
import { cn } from '@/lib/utils'
import { MessageCircle, X } from 'lucide-react'
import { useCallback, useId, useState } from 'react'

import { VisitorChatPanel } from './VisitorChatPanel'

export const VisitorChatWidget = () => {
  const chatRootId = useId()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const { messages, hydrated, isSending, error, sendUserMessage } =
    useVisitorChat()

  const sendDraft = useCallback(async () => {
    const t = draft.trim()
    if (!t || isSending) return
    setDraft('')
    await sendUserMessage(t)
  }, [draft, isSending, sendUserMessage])

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open ? (
        <VisitorChatPanel
          rootId={chatRootId}
          messages={messages}
          hydrated={hydrated}
          isSending={isSending}
          error={error}
          draft={draft}
          onDraftChange={setDraft}
          onSend={() => void sendDraft()}
          onClose={() => setOpen(false)}
        />
      ) : null}

      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'pointer-events-auto h-14 w-14 rounded-full shadow-lg',
          open ? 'bg-slate-800 hover:bg-slate-900' : '',
        )}
        aria-expanded={open}
        aria-controls={open ? chatRootId : undefined}
        aria-label={
          open ? 'Close MentorBridge assistant' : 'Open MentorBridge assistant'
        }
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <MessageCircle className="h-6 w-6" aria-hidden />
        )}
      </Button>
    </div>
  )
}
