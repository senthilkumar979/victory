/** IST = UTC+5:30 (Asia/Kolkata) */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000

export interface ISTParts {
  y: number
  m: number
  d: number
  h: number
  min: number
}

/** Get IST date and time parts from a UTC Date */
export function dateToISTParts(date: Date): ISTParts {
  const istMs = date.getTime() + IST_OFFSET_MS
  const ist = new Date(istMs)
  return {
    y: ist.getUTCFullYear(),
    m: ist.getUTCMonth(),
    d: ist.getUTCDate(),
    h: ist.getUTCHours(),
    min: ist.getUTCMinutes(),
  }
}

/** Build a UTC Date from IST date and time (24h) */
export function dateFromIST(y: number, m: number, d: number, h: number, min: number): Date {
  const utcMs = Date.UTC(y, m, d, h, min, 0, 0) - IST_OFFSET_MS
  return new Date(utcMs)
}

/** IST timezone identifier */
export const IST_TIMEZONE = 'Asia/Kolkata'

/**
 * Format Date to IST ISO string for timestamptz storage.
 * Output: YYYY-MM-DDTHH:mm:ss+05:30
 */
export function toISTISOString(date: Date): string {
  const p = dateToISTParts(date)
  const y = p.y
  const m = (p.m + 1).toString().padStart(2, '0')
  const d = p.d.toString().padStart(2, '0')
  const h = p.h.toString().padStart(2, '0')
  const min = p.min.toString().padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}:00+05:30`
}

/**
 * Parse value (ISO or date-only) and return IST ISO string for timestamptz.
 * Handles: "2025-03-15T09:00:00Z", "2025-03-15T14:30:00+05:30", "2025-03-15"
 */
export function toISTTimestamptz(value: string): string {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  if (trimmed.includes('T')) {
    const d = new Date(trimmed)
    if (Number.isNaN(d.getTime())) return trimmed
    return toISTISOString(d)
  }
  return `${trimmed}T00:00:00+05:30`
}
