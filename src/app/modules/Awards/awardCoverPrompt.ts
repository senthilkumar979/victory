import { stripHtml } from '@/utils/meetingUtils'

import type { AwardFormState } from './Award.types'
import { formatAwardDateDisplay } from './formatAwardDate'

export function buildDefaultAwardCoverPrompt(
  award: AwardFormState,
  categoryName: string,
): string {
  const studentName =
    award.student?.name?.trim() || award.awardedTo || 'Student'
  const desc = stripHtml(award.description ?? '')
  const descShort =
    desc.length > 500 ? `${desc.slice(0, 500).trim()}…` : desc

  return `Create a single professional 16:9 widescreen cover image celebrating a MentorBridge student award.

Awarded to (show as text on the design): ${studentName}
Award category: ${categoryName || 'Award'}
Awarded on: ${formatAwardDateDisplay(award.awardedOn)}
${descShort ? `Recognition / description (context only — do not paste as a wall of text; use for tone):\n${descShort}` : ''}

Do not include any photograph or portrait of a person. Do not use a student headshot or face. No real-person likeness.

Hero visuals: Use a clear award / achievement motif instead — for example a trophy, medal, ribbon, laurel, pedestal, or abstract celebration of excellence (geometric trophy silhouette, minimal medal icon, elegant cup shape). Pick one strong focal element that reads as "recognition" at a glance.

The second image attachment is the official MentorBridge logo (long horizontal wordmark). Integrate it clearly (corner lockup or header band), same as brand guidelines for other MentorBridge covers.

Layout: Clean, modern composition with strong hierarchy. Bold headline area for the recipient name and category. Generous whitespace; brand accent #d53f8c used sparingly for highlights (underline, badge, divider, or subtle gradient).

Visual style: Celebratory yet professional (education + achievement). Prefer soft gradients, subtle depth, minimal geometric shapes. Avoid stock-photo clichés (no random people, no handshakes, no graduation caps thrown in the air).

Typography on-image: Bold, modern sans-serif; high contrast; hierarchy: name > category > date.

Output: High resolution, sharp, presentation-ready. No watermarks. No tiny unreadable text.`
}
