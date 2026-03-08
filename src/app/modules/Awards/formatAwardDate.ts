import { dateToISTParts } from '@/utils/dateISTUtils'

/** Format ISO date string for display: "MMM d, yyyy" in IST */
export function formatAwardDateDisplay(isoString: string): string {
  if (!isoString?.trim()) return '—'
  const date = new Date(isoString.trim())
  if (Number.isNaN(date.getTime())) return isoString
  const p = dateToISTParts(date)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ]
  return `${months[p.m]} ${p.d}, ${p.y}`
}
