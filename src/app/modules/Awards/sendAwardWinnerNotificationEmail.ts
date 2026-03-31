import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'

const CC_EMAIL = 'mentorbridge-2026-offline@googlegroups.com'

const SUBJECT = 'Congratulations on your Award!'

export type SendWithTemplateFn = (payload: {
  to: string | string[]
  templateId: string
  subject?: string
  variables?: Record<string, unknown>
  cc?: string | string[]
}) => Promise<void>

export interface AwardWinnerEmailParams {
  recipientEmail: string
  /** Display name for template; falls back to email local-part if empty */
  awardWinnerDisplayName: string
  awardCategoryName: string
}

function resolveDisplayName(
  email: string,
  explicitName?: string,
): string {
  const n = explicitName?.trim()
  if (n) return n
  const local = email.split('@')[0]?.trim()
  return local || email
}

/**
 * Sends the Resend award-winner template (same payload as {@link AwardFormDrawer} on create).
 */
export async function sendAwardWinnerNotificationEmail(
  sendEmail: SendWithTemplateFn,
  params: AwardWinnerEmailParams,
): Promise<void> {
  const templateId = RESEND_TEMPLATE_IDS.AWARD_WINNER?.trim()
  if (!templateId) return

  const awardWinner = resolveDisplayName(
    params.recipientEmail,
    params.awardWinnerDisplayName,
  )

  await sendEmail({
    to: params.recipientEmail.trim(),
    cc: CC_EMAIL,
    templateId,
    // subject: SUBJECT,
    variables: {
      award_winner: awardWinner,
      award_name: params.awardCategoryName,
    },
  })
}
