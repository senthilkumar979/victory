import { Fragment, type ReactNode } from 'react'

import { ChatCompanyBadge } from '@/components/visitor-chat/ChatCompanyBadge'
import { COMPANY_LOGOS_SORTED_LONGEST_FIRST } from '@/constants/CompanyConstants'
import { renderChatBoldAndMentorbridgeEmails } from '@/lib/renderChatBoldSegments'

function isBoundaryChar(c: string): boolean {
  if (!c) return true
  return !/[a-zA-Z0-9]/.test(c)
}

function findFirstCompanyMatch(
  s: string,
): {
  start: number
  end: number
  entry: (typeof COMPANY_LOGOS_SORTED_LONGEST_FIRST)[number]
} | null {
  const lower = s.toLowerCase()
  let best: {
    start: number
    end: number
    entry: (typeof COMPANY_LOGOS_SORTED_LONGEST_FIRST)[number]
  } | null = null

  for (const entry of COMPANY_LOGOS_SORTED_LONGEST_FIRST) {
    const needle = entry.name.toLowerCase()
    let from = 0
    while (from < s.length) {
      const idx = lower.indexOf(needle, from)
      if (idx === -1) break
      const end = idx + needle.length
      const before = idx === 0 ? ' ' : s[idx - 1]
      const after = end >= s.length ? ' ' : s[end]
      if (isBoundaryChar(before) && isBoundaryChar(after)) {
        if (!best || idx < best.start) {
          best = { start: idx, end, entry }
        }
      }
      from = idx + 1
    }
  }
  return best
}

/**
 * Splits text at known company names and renders each with {@link ChatCompanyBadge};
 * other segments use bold + email rules.
 */
export function renderTextWithCompaniesAndBold(text: string): ReactNode {
  if (!text) return null

  const parts: ReactNode[] = []
  let remaining = text
  let k = 0

  while (remaining.length > 0) {
    const m = findFirstCompanyMatch(remaining)
    if (!m) {
      const tail = renderChatBoldAndMentorbridgeEmails(remaining)
      if (tail !== null) parts.push(<span key={k++}>{tail}</span>)
      break
    }
    if (m.start > 0) {
      const head = remaining.slice(0, m.start)
      const inner = renderChatBoldAndMentorbridgeEmails(head)
      if (inner !== null) parts.push(<span key={k++}>{inner}</span>)
    }
    const atLineStart = m.start === 0 || remaining[m.start - 1] === '\n'
    parts.push(
      <ChatCompanyBadge
        key={k++}
        companyName={m.entry.name}
        size={atLineStart ? 'list' : 'inline'}
      />,
    )
    remaining = remaining.slice(m.end)
  }

  if (parts.length === 0) return null
  return parts.length === 1 ? parts[0] : <Fragment>{parts}</Fragment>
}
