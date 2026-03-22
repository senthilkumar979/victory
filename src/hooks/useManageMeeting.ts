import { useCallback } from 'react'

import { gooeyToast } from 'goey-toast'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

import type { UseMeetingsReturn } from './useMeetings'

const STEP_DELAY_MS = 1000
/** Initial attempt + 2 retries */
const MAX_ATTEMPTS = 3

const toastBase = {
  bounce: 0.45 as const,
  borderColor: '#E0E0E0',
  borderWidth: 2,
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (e) {
      lastError = e
      if (attempt === maxAttempts) break
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

async function fetchFeedbackFormUrl(
  meetingId: string,
  meetingTitle: string,
): Promise<string> {
  const res = await fetch('/api/meetings/create-feedback-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meetingId, meetingTitle }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Feedback form request failed (${res.status})`)
  }
  const data = (await res.json()) as { feedbackFormUrl?: string }
  if (!data.feedbackFormUrl?.trim()) {
    throw new Error('No feedback form URL returned')
  }
  return data.feedbackFormUrl
}

async function fetchGoogleMeetLink(payload: {
  title: string
  date: string
  description: string
  googleGroupId: string
}): Promise<string> {
  const res = await fetch('/api/meetings/create-google-meet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title,
      date: payload.date,
      description: payload.description || undefined,
      attendees: payload.googleGroupId.trim()
        ? [payload.googleGroupId.trim()]
        : ['mentorbridgeindia@gmail.com'],
    }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `Google Meet request failed (${res.status})`)
  }
  const data = (await res.json()) as { meetingLink?: string }
  if (!data.meetingLink?.trim()) {
    throw new Error('No meeting link returned')
  }
  return data.meetingLink
}

type ManageMeetingDeps = Pick<
  UseMeetingsReturn,
  'createMeeting' | 'updateMeeting'
>

export function useManageMeeting({
  createMeeting,
  updateMeeting,
}: ManageMeetingDeps) {
  const createMeetingWithPipeline = useCallback(
    async (payload: Omit<MeetingFormState, 'id'>) => {
      const description = payload.title

      const toastId = gooeyToast.info('Event is being created...', {
        ...toastBase,
        description,
        timing: { displayDuration: 120_000 },
      })

      try {
        const { id: meetingId } = await createMeeting(payload)

        gooeyToast.update(toastId, {
          title: 'Event created in DB successfully!',
          type: 'success',
          description,
        })
        await sleep(STEP_DELAY_MS)

        gooeyToast.update(toastId, {
          title: 'Feedback form creation in progress...',
          type: 'info',
          description,
        })

        let feedbackFormUrl: string | undefined
        try {
          feedbackFormUrl = await withRetry(
            () => fetchFeedbackFormUrl(meetingId, payload.title),
            MAX_ATTEMPTS,
          )
        } catch {
          gooeyToast.update(toastId, {
            title: 'Feedback form creation failed after retries.',
            type: 'warning',
            description,
          })
          await sleep(STEP_DELAY_MS)
        }

        if (feedbackFormUrl) {
          gooeyToast.update(toastId, {
            title: 'Feedback form created successfully!',
            type: 'success',
            description,
          })
          await sleep(STEP_DELAY_MS)
        }

        gooeyToast.update(toastId, {
          title: 'Google meet link creation in progress...',
          type: 'info',
          description,
        })

        let meetingLink: string | undefined
        try {
          meetingLink = await withRetry(
            () =>
              fetchGoogleMeetLink({
                title: payload.title,
                date: payload.date,
                description: payload.description,
                googleGroupId: payload.googleGroupId,
              }),
            MAX_ATTEMPTS,
          )
        } catch {
          gooeyToast.update(toastId, {
            title: 'Google Meet link creation failed after retries.',
            type: 'warning',
            description,
          })
          await sleep(STEP_DELAY_MS)
        }

        if (meetingLink) {
          gooeyToast.update(toastId, {
            title: 'Google meet link created successfully!',
            type: 'success',
            description,
          })
          await sleep(STEP_DELAY_MS)
        }

        const merged: Omit<MeetingFormState, 'id'> = {
          ...payload,
          ...(feedbackFormUrl ? { feedbackForm: feedbackFormUrl } : {}),
          ...(meetingLink ? { meetingLink } : {}),
        }
        await updateMeeting(meetingId, merged)

        gooeyToast.dismiss(toastId)
        gooeyToast.success('Event is updated successfully!', {
          ...toastBase,
          description,
          timing: { displayDuration: 3500 },
        })
      } catch (err) {
        gooeyToast.dismiss(toastId)
        gooeyToast.error('Failed to create meeting.', {
          ...toastBase,
          description:
            err instanceof Error ? err.message : 'Please try again.',
          timing: { displayDuration: 5000 },
        })
        throw err
      }
    },
    [createMeeting, updateMeeting],
  )

  return { createMeetingWithPipeline }
}

