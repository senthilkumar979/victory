import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { resend } from '@/lib/resend'

interface SendEmailWithTemplatePayload {
  to: string | string[]
  templateId: string
  subject?: string
  variables?: Record<string, unknown>
  from?: string
  cc?: string | string[]
}

export async function POST(request: NextRequest) {
  if (!resend) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 },
    )
  }

  let body: SendEmailWithTemplatePayload

  try {
    body = (await request.json()) as SendEmailWithTemplatePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { to, subject, templateId, variables, from, cc } = body

  if (!to || !templateId) {
    return NextResponse.json(
      { error: 'Missing required fields: to, templateId' },
      { status: 400 },
    )
  }

  const fromAddress = from ?? 'mail@mentorbridge.in'

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      cc: cc ?? undefined,
      subject,
      template: {
        id: templateId,
        variables:
          variables as SendEmailWithTemplatePayload['variables'] &
            Record<string, string | number>,
      },
    })

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message ?? 'Failed to send email' },
        { status: 502 },
      )
    }

    return NextResponse.json({ id: result.data?.id }, { status: 200 })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Resend template email error', error)
    return NextResponse.json(
      { error: 'Unexpected error while sending email' },
      { status: 500 },
    )
  }
}

