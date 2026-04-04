import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { RESEND_TEMPLATE_IDS } from '@/constants/ThirdPartyConstants'
import { renderAwardWinnerPdfBuffer } from '@/lib/renderAwardWinnerPdf'
import { resend } from '@/lib/resend'

const CC_EMAIL = 'mentorbridge-2026-offline@googlegroups.com'

const bodySchema = z.object({
  recipientEmail: z.string().email(),
  awardWinnerDisplayName: z.string().optional(),
  awardCategoryName: z.string().min(1),
})

function resolveDisplayName(email: string, explicitName?: string): string {
  const n = explicitName?.trim()
  if (n) return n
  const local = email.split('@')[0]?.trim()
  return local || email
}

export async function POST(request: NextRequest) {
  if (!resend) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 },
    )
  }

  const templateId = RESEND_TEMPLATE_IDS.AWARD_WINNER?.trim()
  if (!templateId) {
    return NextResponse.json(
      { error: 'Award winner template not configured' },
      { status: 500 },
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { recipientEmail, awardWinnerDisplayName, awardCategoryName } =
    parsed.data
  const to = recipientEmail.trim()
  const awardWinner = resolveDisplayName(to, awardWinnerDisplayName)

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await renderAwardWinnerPdfBuffer({
      recipientName: awardWinner,
      awardCategoryName,
    })
  } catch (error) {
    console.error('Award PDF render failed', error)
    return NextResponse.json(
      { error: 'Failed to generate award certificate PDF' },
      { status: 500 },
    )
  }

  const fromAddress = 'mail@mentorbridge.in'

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      cc: CC_EMAIL,
      template: {
        id: templateId,
        variables: {
          award_winner: awardWinner,
          award_name: awardCategoryName,
        },
      },
      attachments: [
        {
          filename: 'MentorBridge-award-certificate.pdf',
          content: pdfBuffer,
        },
      ],
    })

    if (result.error) {
      const errorMessage = result.error.message ?? 'Failed to send email'
      console.error('Resend award email failed:', {
        message: result.error.message,
        name: result.error.name,
        statusCode: (result.error as { statusCode?: number }).statusCode,
      })
      return NextResponse.json({ error: errorMessage }, { status: 502 })
    }

    return NextResponse.json({ id: result.data?.id }, { status: 200 })
  } catch (error) {
    console.error('Resend award email error', error)
    return NextResponse.json(
      { error: 'Unexpected error while sending email' },
      { status: 500 },
    )
  }
}
