import type { AwardFormState } from '@/app/modules/Awards/Award.types'
import { formatAwardDateDisplay } from '@/app/modules/Awards/formatAwardDate'
import { stripHtml } from '@/utils/meetingUtils'

export function getAwardLinkedInPrimaryLink(): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.trim() || 'https://mentorbridge.in'
  return `${base.replace(/\/$/, '')}/hall-of-fame`
}

export function buildAwardLinkedInPostBody(
  award: AwardFormState,
  categoryName: string,
): {
  title: string
  description: string
  primaryLink: string
  context: string
  variant: 'award'
} {
  const studentName =
    award.student?.name?.trim() || award.awardedTo || 'Student'
  const plain = stripHtml(award.description ?? '')
  const title = `Celebrating ${studentName} — ${categoryName || 'MentorBridge Award'}`
  const context = [
    `Awarded to: ${studentName}`,
    `Category: ${categoryName || '—'}`,
    `Awarded on: ${formatAwardDateDisplay(award.awardedOn)}`,
    plain ? `Citation / description: ${plain}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  return {
    title,
    description:
      plain ||
      `Recognition for ${studentName} in ${categoryName || 'this category'}.`,
    primaryLink: getAwardLinkedInPrimaryLink(),
    context,
    variant: 'award',
  }
}
