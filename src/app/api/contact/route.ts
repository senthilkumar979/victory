import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { buildContactFormEmailHtml } from '@/lib/contactFormEmailHtml'
import { contactFormSchema } from '@/lib/contactFormSchema'
import { resend } from '@/lib/resend'

const CONTACT_RECIPIENTS = [
  'senthilkumar@mentorbridge.in',
  'senthilk979@gmail.com',
] as const

const SUBJECT = 'Contact Us form submitted'

export async function POST(request: NextRequest) {
  if (!resend) {
    return NextResponse.json(
      { error: 'Email service not configured' },
      { status: 500 },
    )
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = contactFormSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { fullName, company, email, message } = parsed.data
  const html = buildContactFormEmailHtml({ fullName, company, email, message })

  const fromAddress = 'senthilkumar@mentorbridge.in'

  try {
    const result = await resend.emails.send({
      from: fromAddress,
      to: [...CONTACT_RECIPIENTS],
      subject: SUBJECT,
      html,
      replyTo: email.trim(),
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
    console.error('Contact form email error', error)
    return NextResponse.json(
      { error: 'Unexpected error while sending email' },
      { status: 500 },
    )
  }
}
