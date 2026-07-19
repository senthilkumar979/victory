import 'server-only'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'
import {
  getMobileDb,
  MobileServiceError,
  paginationMeta,
} from '@/lib/mobile/mobileApiUtils'
import { toISTTimestamptz } from '@/utils/dateISTUtils'

const MEETINGS_TABLE = 'meetings'
const SELECT_COLS =
  'id, title, date, google_group_id, description, meeting_link, cover_image_url, feedback_form, feedback_email_sent_at, attendance'

function mapRow(row: Record<string, unknown>): MeetingFormState {
  const arr = (row.attendance ?? []) as unknown[]
  const attendance = arr
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n) && n > 0)
    .sort((a, b) => a - b)
  return {
    id: row.id as string,
    title: (row.title as string) ?? '',
    date: (row.date as string) ?? '',
    googleGroupId: (row.google_group_id as string) ?? '',
    description: (row.description as string) ?? '',
    meetingLink: (row.meeting_link as string) ?? '',
    coverImageUrl: (row.cover_image_url as string) ?? '',
    feedbackForm: (row.feedback_form as string) ?? undefined,
    feedbackEmailSentAt:
      (row.feedback_email_sent_at as string | null) ?? undefined,
    attendance: attendance.length > 0 ? attendance : undefined,
  }
}

function toPayload(form: Omit<MeetingFormState, 'id'>) {
  const base = {
    title: form.title,
    date: toISTTimestamptz(form.date),
    google_group_id: form.googleGroupId,
    description: form.description,
    meeting_link: form.meetingLink,
    cover_image_url: form.coverImageUrl,
  }
  if (form.feedbackForm != null) {
    return { ...base, feedback_form: form.feedbackForm }
  }
  return base
}

export async function listMeetings(
  page = 1,
  limit = 20,
  range?: { from?: string; to?: string },
) {
  const db = getMobileDb()
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = db
    .from(MEETINGS_TABLE)
    .select(SELECT_COLS, { count: 'exact' })
    .order('date', { ascending: Boolean(range?.from) })

  if (range?.from) query = query.gte('date', range.from)
  if (range?.to) query = query.lte('date', range.to)

  const { data, error, count } = await query.range(from, to)

  if (error) {
    console.error('[mobile/meetingService.list]', error)
    throw new MobileServiceError(
      'Could not load meetings.',
      500,
      'INTERNAL_ERROR',
    )
  }

  const meetings = (data ?? []).map((row) =>
    mapRow(row as unknown as Record<string, unknown>),
  )

  return {
    data: meetings,
    pagination: paginationMeta(page, limit, count ?? meetings.length),
  }
}

export async function getMeetingById(id: string) {
  const db = getMobileDb()
  const { data, error } = await db
    .from(MEETINGS_TABLE)
    .select(SELECT_COLS)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[mobile/meetingService.get]', error)
    throw new MobileServiceError(
      'Could not load meeting.',
      500,
      'INTERNAL_ERROR',
    )
  }
  if (!data) {
    throw new MobileServiceError('Meeting not found', 404, 'NOT_FOUND')
  }

  return mapRow(data as unknown as Record<string, unknown>)
}

export async function createMeeting(payload: Omit<MeetingFormState, 'id'>) {
  const db = getMobileDb()
  const { data, error } = await db
    .from(MEETINGS_TABLE)
    .insert(toPayload(payload))
    .select(SELECT_COLS)
    .single()

  if (error) {
    console.error('[mobile/meetingService.create]', error)
    throw new MobileServiceError(
      'Could not create meeting.',
      500,
      'INTERNAL_ERROR',
    )
  }

  return mapRow(data as unknown as Record<string, unknown>)
}

export async function updateMeeting(
  id: string,
  payload: Omit<MeetingFormState, 'id'>,
) {
  const db = getMobileDb()
  const { data, error } = await db
    .from(MEETINGS_TABLE)
    .update(toPayload(payload))
    .eq('id', id)
    .select(SELECT_COLS)
    .maybeSingle()

  if (error) {
    console.error('[mobile/meetingService.update]', error)
    throw new MobileServiceError(
      'Could not update meeting.',
      500,
      'INTERNAL_ERROR',
    )
  }
  if (!data) {
    throw new MobileServiceError('Meeting not found', 404, 'NOT_FOUND')
  }

  return mapRow(data as unknown as Record<string, unknown>)
}

export async function deleteMeeting(id: string) {
  const db = getMobileDb()
  const { error } = await db.from(MEETINGS_TABLE).delete().eq('id', id)
  if (error) {
    console.error('[mobile/meetingService.delete]', error)
    throw new MobileServiceError(
      'Could not delete meeting.',
      500,
      'INTERNAL_ERROR',
    )
  }
}

export async function updateMeetingAttendance(
  id: string,
  attendance: number[],
) {
  const db = getMobileDb()
  const cleaned = attendance
    .map((n) => Number(n))
    .filter((n) => !Number.isNaN(n) && n > 0)
    .sort((a, b) => a - b)

  const { data, error } = await db
    .from(MEETINGS_TABLE)
    .update({ attendance: cleaned })
    .eq('id', id)
    .select(SELECT_COLS)
    .maybeSingle()

  if (error) {
    console.error('[mobile/meetingService.attendance]', error)
    throw new MobileServiceError(
      'Could not update attendance.',
      500,
      'INTERNAL_ERROR',
    )
  }
  if (!data) {
    throw new MobileServiceError('Meeting not found', 404, 'NOT_FOUND')
  }

  return mapRow(data as unknown as Record<string, unknown>)
}
