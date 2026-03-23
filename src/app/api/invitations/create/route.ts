import { clerkClient } from '@clerk/nextjs/server'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

interface CreateInvitationBody {
  emailAddress: string
}

export async function POST(request: NextRequest) {
  try {
    let body: CreateInvitationBody
    try {
      body = (await request.json()) as CreateInvitationBody
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    const emailAddress = body.emailAddress?.trim()
    if (!emailAddress) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 },
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? 'https://mentorbridge.in'
    const redirectUrl = `${baseUrl}/sign-up`

    const client = await clerkClient()
    const invitation = await client.invitations.createInvitation({
      emailAddress,
      redirectUrl,
      publicMetadata: { role: 'student' },
    })

    return NextResponse.json({ invitation }, { status: 201 })
  } catch (err) {
    const rawMessage =
      err instanceof Error ? err.message : 'Failed to create invitation'
    const message =
      rawMessage.toLowerCase().includes('already') ||
      rawMessage.toLowerCase().includes('exists')
        ? 'A user or invitation with this email already exists.'
        : rawMessage

    console.error('Create invitation error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
