import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

import type { ProfileData } from '@/types/student.types'

const SELF_INTRO_PROMPT = `You are a professional writer helping students craft a compelling self-introduction.
Given the following profile details, write a concise, engaging self-introduction (2-4 short paragraphs) that:
- Highlights their professional identity and expertise as a developer or analyst
- Showcases key experiences and skills, emphasizing familiarity with Agile Methodology, SOLID and DRY principles, and best coding practices
- Mentions an enthusiasm for AI and modern technologies
- Reflects their personality and inspirations, including any provided 'inspirations' and 'MentorBridge Experience (myb inspirations)' when available
- Uses first person ("I") and flows naturally for use in networking or applications

Please naturally weave in references to being process-oriented, quality-focused, and upholding industry best practices (such as Agile, SOLID, DRY), and mention a keen interest in AI and continuous learning. 
If available, include both personal inspirations and any MentorBridge Experience or inspirations (myb inspirations).

Respond only with the self-introduction text, no preamble or meta-commentary.`

function buildProfileContext(profile: ProfileData): string {
  const parts: string[] = [
    `Name: ${profile.name}`,
    `Role: ${profile.role}`,
    profile.company ? `Company: ${profile.company}` : null,
    profile.summary ? `Summary: ${profile.summary}` : null,
    profile.batch ? `Batch: ${profile.batch}` : null,
    profile.gender ? `Gender: ${profile.gender}` : null,
  ].filter(Boolean) as string[]

  if (profile.skillSets?.length) {
    parts.push(`Skills: ${profile.skillSets.join(', ')}`)
  }
  if (profile.inspirations?.length) {
    parts.push(`Inspirations: ${profile.inspirations.join(', ')}`)
  }
  if (profile.experience?.length) {
    const exp = profile.experience
      .slice(0, 5)
      .map((e) => `${e.role} at ${e.company} - ${e.summary}`)
      .join('\n')
    parts.push(`Experience:\n${exp}`)
  }
  if (profile.mentorBridgeExp) {
    const mb = profile.mentorBridgeExp
    parts.push(
      `MentorBridge Experience: ${mb.role} at ${mb.company} - ${mb.summary}`,
    )
  }

  return parts.join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API is not configured' },
        { status: 500 },
      )
    }

    let profile: ProfileData
    try {
      profile = (await request.json()) as ProfileData
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 },
      )
    }

    if (!profile?.name) {
      return NextResponse.json(
        { error: 'Profile data with name is required' },
        { status: 400 },
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const modelId = 'gemini-2.5-flash'
    const model = genAI.getGenerativeModel({ model: modelId })

    const profileContext = buildProfileContext(profile)
    const result = await model.generateContent(
      `${SELF_INTRO_PROMPT}\n\n---\nProfile:\n${profileContext}`,
    )
    const response = result.response
    const text = response.text()?.trim()

    if (!text) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 502 },
      )
    }

    return NextResponse.json({ selfIntro: text }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate self-intro'
    console.error('Generate self-intro error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
