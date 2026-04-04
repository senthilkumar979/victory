export interface AwardWinnerEmailParams {
  recipientEmail: string
  /** Display name for template; falls back to email local-part if empty */
  awardWinnerDisplayName: string
  awardCategoryName: string
}

/**
 * Sends the Resend award-winner template with a PDF certificate attachment
 * ({@link AwardCertificatePdf}) via `POST /api/email/send-award-winner`.
 */
export async function sendAwardWinnerNotificationEmail(
  params: AwardWinnerEmailParams,
): Promise<void> {
  const response = await fetch('/api/email/send-award-winner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recipientEmail: params.recipientEmail.trim(),
      awardWinnerDisplayName: params.awardWinnerDisplayName,
      awardCategoryName: params.awardCategoryName,
    }),
  })

  const body = (await response.json()) as { error?: string }

  if (!response.ok) {
    const message =
      typeof body?.error === 'string'
        ? body.error
        : 'Failed to send award notification email'
    throw new Error(message)
  }
}
