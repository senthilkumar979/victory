const DUE_SOON_MS = 72 * 60 * 60 * 1000

export function getAssignmentDueStatus(dueDate: string): 'upcoming' | 'due_soon' | 'past_due' {
  const due = new Date(dueDate).getTime()
  const now = Date.now()
  if (now > due) return 'past_due'
  if (due - now <= DUE_SOON_MS) return 'due_soon'
  return 'upcoming'
}

export function isPastDue(dueDate: string): boolean {
  return Date.now() > new Date(dueDate).getTime()
}

export function formatDueDate(dueDate: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(dueDate))
}

export function extractGoogleDocId(url: string): string | null {
  const match = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/)
  return match?.[1] ?? null
}

export function getGoogleDocPreviewUrl(url: string): string | null {
  const id = extractGoogleDocId(url)
  if (!id) return null
  return `https://docs.google.com/document/d/${id}/preview`
}
