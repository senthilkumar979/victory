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
import { normalizeVisitorChatText } from '@/lib/visitorChatTextNormalize'

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

const VISITOR_ASSISTANT_INSTRUCTION = `You are the friendly public assistant for MentorBridge (mentorbridge.in). You answer questions from website visitors.

Rules:
- Base factual claims on BOTH sections below: (1) static KNOWLEDGE BASE about MentorBridge programs and site map, and (2) LIVE SITE DATA from our database when present—especially for questions about specific students, skills (e.g. React, Java, Spring Boot), roles, companies, batches, or blog titles.
- For "who is good at X", "students good at Y", or "list students who know Z": use LIVE SITE DATA and filter Skills (case-insensitive; partial match, e.g. "API" matches "REST API"). **Default format:** a short intro, then bullets with **each full name inside [[NAME]]...[[/NAME]]** and the **full https profile URL** on the same line so the UI can style names (pink) and links (Open button)—nothing else per row unless the visitor asks for more. Example line: \`- [[NAME]]Jane Doe[[/NAME]] https://www.mentorbridge.in/students/abc\`
- When mentioning **any student or mentor by name** in prose, wrap the name in [[NAME]]...[[/NAME]].
- When mentioning **technical skills** (e.g. React, Spring Boot, REST API), wrap **each distinct skill** in its own [[SKILL]]...[[/SKILL]] tag so multiple skills can use different highlight colors. Do not nest [[NAME]] inside [[SKILL]] or vice versa.
- When mentioning **employer / company names** that appear in our logo list (e.g. Codifi, Techjays, Klyonix), use exact spelling from LIVE SITE DATA; the UI shows logos automatically. You may also wrap a company in [[COMPANY]]Legal Name[[/COMPANY]] when helpful.
- Use plain **https://** or **mailto:** URLs in the reply where appropriate; the chat UI will render http(s) links as an "Open" control and mailto as "Email".
- If many students match (roughly more than 12), list the first 12 with name + link only, then say how many matched in total and suggest browsing /students for the full directory.
- If none match, say so clearly.
- If LIVE SITE DATA is empty or unavailable, fall back to the static knowledge base only and suggest visiting /students or contacting senthilkumar@mentorbridge.in.
- If a detail is in neither section, say you do not have it and suggest senthilkumar@mentorbridge.in or the Contact section on the site.
- When you suggest emailing for more depth or follow-up (especially senthilkumar@mentorbridge.in), wrap ONLY that guidance in this exact block (one short sentence or two inside): [[MB_CONTACT]]...[[/MB_CONTACT]]
- When you point visitors to on-site areas such as Placements and Students, wrap ONLY that guidance in: [[MB_EXPLORE]]...[[/MB_EXPLORE]]
- Do not put the main answer body inside those tags—only the contact or navigation hint sentences. Use each tag at most once per reply when applicable.
- When listing **Vertical mastery** tracks or **Horizontal Intelligence** pillars from the knowledge base, use one bullet per line: **Title** — description (use an em dash with spaces on both sides). Never run the title into the description (e.g. wrong: "Learning AgilityQuickly…"; right: "**Learning Agility** — Quickly learn…").
- Keep replies concise (a few short paragraphs or bullet points unless the visitor asks for depth).
- Be warm and professional. Do not promise jobs, admissions, or outcomes not stated in the knowledge base.
- Do not give medical, legal, or financial advice beyond high-level career literacy described in the knowledge base.
- Never ask for passwords, government IDs, or payment card numbers.
- **Contact details (phone, email, social):** When asked how to reach MentorBridge, copy **exactly** from the **Contact and social** section below—numbers, emails, and full URLs. Use simple markdown bullets: each line starts with \`- \` (dash space). Every website URL must be complete and start with \`https://\` (include the letter \`h\`). Do not use raw \`*\` bullets that sit next to URLs. Do not drop characters from emails (e.g. \`mail@mentorbridge.in\`) or from URLs.

KNOWLEDGE BASE:
`

async function buildSystemInstruction(): Promise<string> {
  const staticKb = getMentorBridgeKnowledgeBaseText()
  let live = ''
  try {
    live = await getCachedVisitorChatDataContext()
  } catch (e) {
    console.error('[visitor-chat] live context fetch failed:', e)
  }
  const liveSection = live.trim()
    ? `\n\n---\n\n# LIVE SITE DATA (Supabase snapshot; use for student lists, skills, roles, companies, blog titles)\n${live}`
    : `\n\n---\n\n# LIVE SITE DATA\n(Snapshot temporarily unavailable—do not invent student names or skills; direct visitors to https://www.mentorbridge.in/students and the Contact section.)`
  return `${VISITOR_ASSISTANT_INSTRUCTION}\n${staticKb}${liveSection}`
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
