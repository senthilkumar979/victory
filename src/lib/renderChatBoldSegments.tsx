import { Fragment, type ReactNode } from 'react'

const MENTORBRIDGE_EMAIL_CHUNK = /^[a-zA-Z0-9._%+-]+@mentorbridge\.in$/i

/**
 * Renders plain text with Markdown-style **bold** segments as <strong>.
 */
export function renderChatBoldSegments(text: string): ReactNode {
  if (!text) return null

  const nodes: ReactNode[] = []
  let i = 0
  let key = 0

  while (i < text.length) {
    const open = text.indexOf('**', i)
    if (open === -1) {
      nodes.push(<span key={key++}>{text.slice(i)}</span>)
      break
    }
    if (open > i) {
      nodes.push(<span key={key++}>{text.slice(i, open)}</span>)
    }
    const close = text.indexOf('**', open + 2)
    if (close === -1) {
      nodes.push(<span key={key++}>{text.slice(open)}</span>)
      break
    }
    const inner = text.slice(open + 2, close)
    nodes.push(
      <strong key={key++} className="font-semibold">
        {inner}
      </strong>,
    )
    i = close + 2
  }

  return nodes.length === 1 ? nodes[0] : <Fragment>{nodes}</Fragment>
}

/**
 * Like {@link renderChatBoldSegments}, plus any `*@mentorbridge.in` address shown in semibold.
 */
export function renderChatBoldAndMentorbridgeEmails(text: string): ReactNode {
  if (!text) return null

  const parts = text.split(/([a-zA-Z0-9._%+-]+@mentorbridge\.in)/gi)
  const nodes: ReactNode[] = []
  let key = 0

  for (const part of parts) {
    if (!part) continue
    if (MENTORBRIDGE_EMAIL_CHUNK.test(part)) {
      nodes.push(
        <strong key={key++} className="font-semibold">
          {part}
        </strong>,
      )
      continue
    }
    const inner = renderChatBoldSegments(part)
    if (inner !== null) nodes.push(<span key={key++}>{inner}</span>)
  }

  return nodes.length === 0 ? null : nodes.length === 1 ? nodes[0] : <Fragment>{nodes}</Fragment>
}
