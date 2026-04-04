'use client'

import { renderChatRichContent } from '@/lib/renderChatRichContent'
import { parseAssistantVisitorMessage } from '@/lib/parseAssistantVisitorMessage'
import { cn } from '@/lib/utils'
import { Compass, Mail } from 'lucide-react'
import Link from 'next/link'

const MENTORBRIDGE_EMAIL_RE = /([a-zA-Z0-9._%+-]+@mentorbridge\.in)/i

interface VisitorAssistantMessageProps {
  content: string
  className?: string
}

function ContactHint({ text }: { text: string }) {
  const match = text.match(MENTORBRIDGE_EMAIL_RE)
  const email = match?.[1] ?? 'senthilkumar@mentorbridge.in'

  return (
    <div
      className={cn(
        'rounded-xl border border-amber-200/90 bg-gradient-to-br from-amber-50 via-white to-orange-50/50 p-3 shadow-sm',
        'ring-1 ring-amber-100/80',
      )}
    >
      <div className="flex gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-800"
          aria-hidden
        >
          <Mail className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-900/70">
            Go deeper
          </p>
          <div className="text-sm leading-relaxed text-amber-950/90">
            {renderChatRichContent(text)}
          </div>
          <a
            href={`mailto:${email}`}
            className="inline-flex w-fit items-center rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <span className="font-medium opacity-95">Email:&nbsp;&nbsp; </span>
            <strong className="font-bold">{email}</strong>
          </a>
        </div>
      </div>
    </div>
  )
}

function ExploreHint({ text }: { text: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/95 via-white to-sky-50/40 p-3 shadow-sm',
        'ring-1 ring-indigo-100/70',
      )}
    >
      <div className="flex gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-800"
          aria-hidden
        >
          <Compass className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-indigo-900/65">
            On this website
          </p>
          <div className="text-sm leading-relaxed text-slate-800">
            {renderChatRichContent(text)}
          </div>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-indigo-200/90 bg-white px-2.5 py-1 text-xs font-medium text-indigo-900 shadow-xs transition-colors hover:border-indigo-300 hover:bg-indigo-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
            >
              Placements
            </Link>
            <Link
              href="/students"
              className="inline-flex items-center rounded-lg border border-indigo-200/90 bg-white px-2.5 py-1 text-xs font-medium text-indigo-900 shadow-xs transition-colors hover:border-indigo-300 hover:bg-indigo-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1"
            >
              Students
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const VisitorAssistantMessage = ({
  content,
  className,
}: VisitorAssistantMessageProps) => {
  const segments = parseAssistantVisitorMessage(content)

  return (
    <div className={cn('space-y-3', className)}>
      {segments.map((seg, i) => {
        if (seg.type === 'contact') {
          return <ContactHint key={`contact-${i}`} text={seg.text} />
        }
        if (seg.type === 'explore') {
          return <ExploreHint key={`explore-${i}`} text={seg.text} />
        }
        return (
          <div
            key={`body-${i}`}
            className="whitespace-pre-wrap break-words text-sm leading-relaxed"
          >
            {renderChatRichContent(seg.text)}
          </div>
        )
      })}
    </div>
  )
}
