import { useCallback, useState } from 'react'

interface SendEmailWithTemplatePayload {
  to: string | string[]
  templateId: string
  subject?: string
  variables?: Record<string, unknown>
}

interface SendEmailWithTemplateResponse {
  id?: string
  error?: string
}

interface UseSendEmailWithTemplateResult {
  sendEmail: (payload: SendEmailWithTemplatePayload) => Promise<void>
  isSending: boolean
  error: Error | null
  lastEmailId?: string
}

export const useSendEmailWithTemplate =
  (): UseSendEmailWithTemplateResult => {
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [lastEmailId, setLastEmailId] = useState<string | undefined>()

    const sendEmail = useCallback(
      async (payload: SendEmailWithTemplatePayload) => {
        setIsSending(true)
        setError(null)
        setLastEmailId(undefined)

        try {
          const response = await fetch('/api/email/send-with-template', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          })

          const body = (await response.json()) as SendEmailWithTemplateResponse

          if (!response.ok) {
            const message =
              typeof body?.error === 'string'
                ? body.error
                : 'Failed to send email'

            throw new Error(message)
          }

          if (body?.id) setLastEmailId(body.id)
        } catch (err) {
          const errorInstance =
            err instanceof Error
              ? err
              : new Error('Unexpected error while sending email')

          setError(errorInstance)
          throw errorInstance
        } finally {
          setIsSending(false)
        }
      },
      [],
    )

    return {
      sendEmail,
      isSending,
      error,
      lastEmailId,
    }
  }

