import { google } from 'googleapis'

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing Google OAuth credentials: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN',
    )
  }
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret)
  oauth2Client.setCredentials({ refresh_token: refreshToken.trim() })
  return oauth2Client
}

async function getAccessToken(): Promise<string> {
  try {
    const client = getOAuth2Client()
    const result = await client.getAccessToken()
    const token =
      (result as { credentials?: { access_token?: string } })?.credentials
        ?.access_token ??
      (result as { token?: string })?.token ??
      (result as { access_token?: string })?.access_token
    if (!token) throw new Error('Failed to obtain Google access token')
    return token
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (
      msg.includes('access_token') ||
      msg.includes('invalid_grant') ||
      msg.includes('unauthorized')
    ) {
      throw new Error(
        `${msg}. Ensure your refresh token includes the Forms scope: https://www.googleapis.com/auth/forms.body — re-authorize in OAuth Playground with both Calendar and Forms scopes.`,
      )
    }
    throw err
  }
}

const FEEDBACK_QUESTIONS = [
  { title: 'Rate the meeting (1-10)', scale: { low: 1, high: 10 } },
  { title: 'How well did you understand?', paragraph: true },
  {
    title: 'How well was the presenter equipped with the topic?',
    paragraph: true,
  },
  { title: 'Things that you liked', paragraph: true },
  { title: 'How to make the meeting even better', paragraph: true },
] as const

export async function createMeetingFeedbackForm(
  meetingTitle: string,
): Promise<string | null> {
  let token: string
  try {
    token = await getAccessToken()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const hint =
      msg.includes('access_token') || msg.includes('credentials')
        ? ' Ensure your refresh token includes scope https://www.googleapis.com/auth/forms.body (regenerate via OAuth Playground).'
        : ''
    throw new Error(`Google Forms auth failed: ${msg}${hint}`)
  }
  const title = `Feedback: ${meetingTitle}`

  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      info: { title, documentTitle: title, description: `Thank you for your active participation in today’s discussion regarding ${meetingTitle}. Your insights are vital as we move forward with our next steps. We want to ensure these sessions remain a valuable use of your time. Please share your feedback on the content and format of the meeting. Thanks again for your time and contribution.` },
    }),
  })
  if (!createRes.ok) {
    const err = await createRes.text()
    console.error('Google Forms create error:', createRes.status, err)
    throw new Error(`Failed to create form: ${err}`)
  }
  const createData = (await createRes.json()) as {
    formId?: string
    responderUri?: string
  }
  const formId = createData.formId
  if (!formId) throw new Error('No formId in create response')

  const requests = FEEDBACK_QUESTIONS.map((q, idx) => {
    const item: Record<string, unknown> = {
      title: q.title,
      questionItem: {
        question: {
          required: true,
          ...(q.scale
            ? { scaleQuestion: q.scale }
            : { textQuestion: { paragraph: true } }),
        },
      },
    }
    return {
      createItem: {
        item,
        location: { index: idx },
      },
    }
  })

  const batchRes = await fetch(
    `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    },
  )
  if (!batchRes.ok) {
    const err = await batchRes.text()
    console.error('Google Forms batchUpdate error:', batchRes.status, err)
    throw new Error(`Failed to add questions: ${err}`)
  }

  return (
    createData.responderUri ??
    `https://docs.google.com/forms/d/${formId}/viewform`
  )
}
