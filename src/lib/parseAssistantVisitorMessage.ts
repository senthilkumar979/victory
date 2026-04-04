export type VisitorAssistantSegment =
  | { type: 'body'; text: string }
  | { type: 'contact'; text: string }
  | { type: 'explore'; text: string }

const MARKER_BLOCK =
  /\[\[MB_(CONTACT|EXPLORE)\]\]([\s\S]*?)\[\[\/MB_\1\]\]/g

function mergeBodySegments(segments: VisitorAssistantSegment[]): VisitorAssistantSegment[] {
  const out: VisitorAssistantSegment[] = []
  for (const s of segments) {
    const last = out[out.length - 1]
    if (s.type === 'body' && last?.type === 'body') {
      last.text = `${last.text}\n\n${s.text}`
    } else {
      out.push({ ...s })
    }
  }
  return out
}

function isContactHint(text: string): boolean {
  const t = text.trim()
  if (t.length > 450) return false
  if (!/@mentorbridge\.in/i.test(t)) return false
  return /reach\s+out|contact|email|get\s+in\s+touch|write\s+to|drop\s+(a\s+)?line|connect\s+with|more\s+depth|further\s+question|personal\s+follow|touch\s+with/i.test(
    t,
  )
}

function isExploreHint(text: string): boolean {
  const t = text.trim()
  if (t.length > 450) return false
  if (!/placements?/i.test(t) || !/students?/i.test(t)) return false
  return /section|website|web\s*site|on\s+the\s+site|this\s+site|mentorbridge|find\s+more|more\s+information|browse|explore/i.test(
    t,
  )
}

function segmentBodyByHeuristics(raw: string): VisitorAssistantSegment[] {
  const chunks = raw.split(/\n\n+/).map((c) => c.trim()).filter(Boolean)
  const segments: VisitorAssistantSegment[] = []
  for (const chunk of chunks) {
    if (isContactHint(chunk)) segments.push({ type: 'contact', text: chunk })
    else if (isExploreHint(chunk)) segments.push({ type: 'explore', text: chunk })
    else segments.push({ type: 'body', text: chunk })
  }
  return mergeBodySegments(segments)
}

function parseWithMarkers(content: string): VisitorAssistantSegment[] {
  const segments: VisitorAssistantSegment[] = []
  let lastIndex = 0
  MARKER_BLOCK.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = MARKER_BLOCK.exec(content)) !== null) {
    if (m.index > lastIndex) {
      const body = content.slice(lastIndex, m.index).trim()
      if (body) segments.push(...segmentBodyByHeuristics(body))
    }
    const kind = m[1].toUpperCase() === 'CONTACT' ? 'contact' : 'explore'
    const inner = m[2].trim()
    if (inner) segments.push({ type: kind, text: inner })
    lastIndex = m.index + m[0].length
  }
  if (lastIndex < content.length) {
    const tail = content.slice(lastIndex).trim()
    if (tail) segments.push(...segmentBodyByHeuristics(tail))
  }
  return mergeBodySegments(segments)
}

/**
 * Splits assistant copy into body vs. styled hint blocks (contact email vs. on-site sections).
 */
export function parseAssistantVisitorMessage(content: string): VisitorAssistantSegment[] {
  const trimmed = content.trim()
  if (!trimmed) return []

  if (/\[\[MB_(CONTACT|EXPLORE)\]\]/.test(trimmed)) {
    const parsed = parseWithMarkers(trimmed)
    return parsed.length ? parsed : [{ type: 'body', text: trimmed }]
  }

  return segmentBodyByHeuristics(trimmed)
}
