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
