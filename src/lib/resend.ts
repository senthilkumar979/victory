import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY

if (!apiKey) {
  // eslint-disable-next-line no-console
  console.warn('RESEND_API_KEY is not set. Email sending will be disabled.')
}

export const resend =
  apiKey != null && apiKey.trim().length > 0 ? new Resend(apiKey) : null

