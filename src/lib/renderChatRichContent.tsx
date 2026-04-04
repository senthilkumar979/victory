import { Fragment, type ReactNode } from 'react'

import { ChatCompanyBadge } from '@/components/visitor-chat/ChatCompanyBadge'
import { ChatOpenLink } from '@/components/visitor-chat/ChatOpenLink'
import { renderTextWithCompaniesAndBold } from '@/lib/chatCompanyRichText'
import { renderChatBoldSegments } from '@/lib/renderChatBoldSegments'
import { normalizeVisitorChatText } from '@/lib/visitorChatTextNormalize'

/** MentorBridge accent (matches Mentors section) */
export const CHAT_NAME_COLOR = '#d53f8c'
/** Primary skill color; additional skills cycle through SKILL_COLORS */
export const CHAT_SKILL_COLORS = [
  '#0ea5e9',
  '#06b6d4',
  '#14b8a6',
  '#3b82f6',
  '#38bdf8',
  '#6366f1',
] as const

const COMPANY_BLOCK = /^\[\[COMPANY\]\]([\s\S]*?)\[\[\/COMPANY\]\]/
const NAME_BLOCK = /^\[\[NAME\]\]([\s\S]*?)\[\[\/NAME\]\]/
const SKILL_BLOCK = /^\[\[SKILL\]\]([\s\S]*?)\[\[\/SKILL\]\]/
const URL_START = /^(mailto:[^\s]+|https?:\/\/[^\s]+)/i

interface RichOptions {
  linkOnPrimary?: boolean
}

/**
 * [[NAME]]/[[SKILL]] markers, http(s)/mailto as Open/Email buttons, **bold**, emails.
 */
export function renderChatRichContent(
  text: string,
  options: RichOptions = {},
): ReactNode {
  const normalized = normalizeVisitorChatText(text)
  if (!normalized) return null

  const skillIdx = { n: 0 }
  const nodes: ReactNode[] = []
  let key = 0
  const linkClass = options.linkOnPrimary
    ? 'inline-flex items-center gap-1 rounded-md border border-primary-foreground/35 bg-primary-foreground/12 px-2 py-0.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary-foreground/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50'
    : undefined

  let pos = 0
  let buffer = ''

  const flushBuffer = () => {
    if (!buffer) return
    const rendered = renderTextWithCompaniesAndBold(buffer)
    if (rendered !== null) nodes.push(<span key={key++}>{rendered}</span>)
    buffer = ''
  }

  while (pos < normalized.length) {
    const rest = normalized.slice(pos)
    const companyM = rest.match(COMPANY_BLOCK)
    if (companyM) {
      flushBuffer()
      const inner = companyM[1].trim()
      nodes.push(
        <span key={key++} className="inline-flex align-middle">
          <ChatCompanyBadge companyName={inner} size="list" />
        </span>,
      )
      pos += companyM[0].length
      continue
    }

    const nameM = rest.match(NAME_BLOCK)
    if (nameM) {
      flushBuffer()
      nodes.push(
        <span
          key={key++}
          className="font-bold"
          style={{ color: CHAT_NAME_COLOR }}
        >
          {renderChatBoldSegments(nameM[1])}
        </span>,
      )
      pos += nameM[0].length
      continue
    }

    const skillM = rest.match(SKILL_BLOCK)
    if (skillM) {
      flushBuffer()
      const color =
        CHAT_SKILL_COLORS[skillIdx.n % CHAT_SKILL_COLORS.length] ??
        CHAT_SKILL_COLORS[0]
      skillIdx.n += 1
      nodes.push(
        <span key={key++} className="font-semibold" style={{ color }}>
          {renderChatBoldSegments(skillM[1])}
        </span>,
      )
      pos += skillM[0].length
      continue
    }

    const urlM = rest.match(URL_START)
    if (urlM) {
      flushBuffer()
      const raw = urlM[0]
      const href = raw.replace(/[.,;:!?)]+$/, '')
      nodes.push(
        <ChatOpenLink key={key++} href={href} className={linkClass} />,
      )
      pos += raw.length
      continue
    }

    if (rest.startsWith('**')) {
      flushBuffer()
      const close = rest.indexOf('**', 2)
      if (close === -1) {
        buffer += normalized[pos]
        pos += 1
        continue
      }
      const inner = rest.slice(2, close)
      nodes.push(
        <strong key={key++} className="font-semibold">
          {inner}
        </strong>,
      )
      pos += close + 4
      continue
    }

    buffer += normalized[pos]
    pos += 1
  }

  flushBuffer()

  if (nodes.length === 0) return null
  return nodes.length === 1 ? nodes[0] : <Fragment>{nodes}</Fragment>
}
