import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { getMentorBridgeKnowledgeBaseText } from '@/data/mentorBridgeKnowledgeBase'
import { getCachedVisitorChatDataContext } from '@/lib/visitorChatDataContext'
import { VISITOR_CHAT_GENERIC_ERROR } from '@/lib/visitorChatClientError'
import {
  VISITOR_CHAT_MAX_MESSAGE_CHARS,
  VISITOR_CHAT_MAX_MESSAGES,
} from '@/lib/visitorChatLimits'
import { insertVisitorChatQuery } from '@/lib/visitorChatQueryLog'
import { normalizeVisitorChatText } from '@/lib/visitorChatTextNormalize'
import { VISITOR_ASSISTANT_INSTRUCTION } from '@/lib/visitorChatSystemInstruction'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(VISITOR_CHAT_MAX_MESSAGE_CHARS),
})

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(VISITOR_CHAT_MAX_MESSAGES),
})

/** Gemini requires chat history to start with a user turn; UI may prepend a welcome assistant message. */
function stripLeadingAssistantTurns(
  messages: z.infer<typeof messageSchema>[],
): z.infer<typeof messageSchema>[] {
  let start = 0
  while (start < messages.length && messages[start].role === 'assistant') {
    start += 1
  }
  return messages.slice(start)
}

async function buildSystemInstruction(): Promise<string> {
  const staticKb = getMentorBridgeKnowledgeBaseText()
  let live = ''
  try {
    live = await getCachedVisitorChatDataContext()
  } catch (e) {
    console.error('[visitor-chat] live context fetch failed:', e)
  }
  const liveSection = live.trim()
    ? '\n\n---\n\n# LIVE SITE DATA (Supabase snapshot; use for student lists, skills, roles, companies, blog titles)\n' +
      live
    : '\n\n---\n\n# LIVE SITE DATA\n(Snapshot temporarily unavailable—do not invent student names or skills; direct visitors to https://www.mentorbridge.in/students and the Contact section.)'
  return (
    VISITOR_ASSISTANT_INSTRUCTION + '\n' + staticKb + liveSection
  )
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chat is temporarily unavailable.' },
        { status: 503 },
      )
    }

    let json: unknown
    try {
      json = await request.json()
    } catch {
      console.warn('[visitor-chat] request body is not valid JSON')
      return NextResponse.json(
        { error: VISITOR_CHAT_GENERIC_ERROR },
        { status: 400 },
      )
    }

    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      console.warn('[visitor-chat] message validation failed:', parsed.error.flatten())
      return NextResponse.json(
        { error: VISITOR_CHAT_GENERIC_ERROR },
        { status: 400 },
      )
    }

    const { messages } = parsed.data
    const last = messages[messages.length - 1]
    if (last.role !== 'user') {
      console.warn('[visitor-chat] last message was not from user')
      return NextResponse.json(
        { error: VISITOR_CHAT_GENERIC_ERROR },
        { status: 400 },
      )
    }

    await insertVisitorChatQuery({
      query: last.content,
      threadMessageCount: messages.length,
    })

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: await buildSystemInstruction(),
    })

    const priorRaw = messages.slice(0, -1)
    const priorForModel = stripLeadingAssistantTurns(priorRaw)
    const prior = priorForModel.map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({ history: prior })
    const result = await chat.sendMessage(last.content)
    const text = result.response.text()?.trim()

    if (!text) {
      console.warn('[visitor-chat] empty model response')
      return NextResponse.json({ error: VISITOR_CHAT_GENERIC_ERROR }, { status: 502 })
    }

    return NextResponse.json(
      { reply: normalizeVisitorChatText(text) },
      { status: 200 },
    )
  } catch (err) {
    console.error('Visitor chat error:', err)
    return NextResponse.json(
      {
        error:
          'The assistant could not respond just now. Please try again in a moment.',
      },
      { status: 500 },
    )
  }
}
