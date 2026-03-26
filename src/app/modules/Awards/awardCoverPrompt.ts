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

Awarded to: ${studentName}
Award category: ${categoryName || 'Award'}
Awarded on: ${formatAwardDateDisplay(award.awardedOn)}
${descShort ? `Recognition / description:\n${descShort}` : ''}

The second image attachment is the official MentorBridge logo (long horizontal wordmark). The third image (if present) is a reference photo of the awardee — incorporate it tastefully (e.g. portrait area, circular frame, or side panel) while keeping the layout professional. Do not distort faces awkwardly. Use the student image exactly as provided — no face modification, no AI enhancement, no style transfer, no beautification, no reshaping, no expression change.
Do not crop important facial features.
Only allowed adjustments: resize, position, subtle background blending, and optional circular or rounded frame mask.
Maintain natural skin tone, lighting, and proportions.
Ensure the face looks realistic and untouched.
Layout guidance: Clean, modern composition with strong hierarchy.
Place student image in a dedicated portrait area (right side or balanced panel layout).
Keep ample whitespace for a premium feel.
Align text and elements using a grid system.

Visual style:

Celebratory yet professional (education + achievement theme).
Use brand accent color #d53f8c sparingly for highlights (underline, badge, divider, or subtle gradient).
Prefer soft gradients, abstract shapes, or minimal geometric elements.
Avoid stock-photo clichés (no random people, no handshake visuals, no caps flying, etc.).

Typography: Bold, modern sans-serif.
High contrast for readability.
Clear visual hierarchy: Name > Award > Date.

Output quality: High resolution, sharp, presentation-ready. No watermark artifacts.
No clutter, no tiny unreadable text, no watermark artifacts.`
}
