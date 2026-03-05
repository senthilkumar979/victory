import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { resend } from '@/lib/resend'

interface SendEmailPayload {
  to: string | string[]
  subject: string
  html: string
  from?: string
}

export async function POST(request: NextRequest) {
  if (!resend) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 },
    )
  }

  let body: SendEmailPayload

  try {
    body = (await request.json()) as SendEmailPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { to, subject, html, from } = body

  if (!to || !subject || !html) {
    return NextResponse.json(
      { error: 'Missing required fields: to, subject, html' },
      { status: 400 },
    )
  }

  const fromAddress = from ?? 'Victory Admin <no-reply@victory-demo.dev>'

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      html,
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
    console.error('Resend email error', error)
    return NextResponse.json(
      { error: 'Unexpected error while sending email' },
      { status: 500 },
    )
  }
}

