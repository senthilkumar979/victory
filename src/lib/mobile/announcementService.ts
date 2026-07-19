import 'server-only'

import {
  getMobileDb,
  MobileServiceError,
  paginationMeta,
} from '@/lib/mobile/mobileApiUtils'

export interface AnnouncementRecord {
  id: string
  title: string
  description: string
  created_at?: string
}

export async function listAnnouncements(page = 1, limit = 20) {
  const db = getMobileDb()
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await db
    .from('announcements')
    .select('id, title, description, created_at', { count: 'exact' })
    .order('id', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[mobile/announcementService.list]', error)
    throw new MobileServiceError(
      'Could not load announcements.',
      500,
      'INTERNAL_ERROR',
    )
  }

  const announcements = (data ?? []) as AnnouncementRecord[]
  return {
    data: announcements,
    pagination: paginationMeta(page, limit, count ?? announcements.length),
  }
}

export async function createAnnouncement(payload: {
  title: string
  description: string
}) {
  const db = getMobileDb()
  const { data, error } = await db
    .from('announcements')
    .insert({
      title: payload.title.trim(),
      description: payload.description.trim(),
    })
    .select('id, title, description, created_at')
    .single()

  if (error) {
    console.error('[mobile/announcementService.create]', error)
    throw new MobileServiceError(
      'Could not create announcement.',
      500,
      'INTERNAL_ERROR',
    )
  }

  const broadcastEndpoint = process.env.NEXT_PUBLIC_PUSH_BROADCAST_ENDPOINT
  if (broadcastEndpoint) {
    try {
      void fetch(broadcastEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          body: 'A new announcement has been published.',
          url: '/announcements',
        }),
      })
    } catch (broadcastError) {
      console.error(
        '[mobile/announcementService] push broadcast failed',
        broadcastError,
      )
    }
  }

  return data as AnnouncementRecord
}

export async function updateAnnouncement(
  id: string,
  payload: { title: string; description: string },
) {
  const db = getMobileDb()
  const { data, error } = await db
    .from('announcements')
    .update({
      title: payload.title.trim(),
      description: payload.description.trim(),
    })
    .eq('id', id)
    .select('id, title, description, created_at')
    .maybeSingle()

  if (error) {
    console.error('[mobile/announcementService.update]', error)
    throw new MobileServiceError(
      'Could not update announcement.',
      500,
      'INTERNAL_ERROR',
    )
  }
  if (!data) {
    throw new MobileServiceError('Announcement not found', 404, 'NOT_FOUND')
  }

  return data as AnnouncementRecord
}

export async function deleteAnnouncement(id: string) {
  const db = getMobileDb()
  const { error } = await db.from('announcements').delete().eq('id', id)
  if (error) {
    console.error('[mobile/announcementService.delete]', error)
    throw new MobileServiceError(
      'Could not delete announcement.',
      500,
      'INTERNAL_ERROR',
    )
  }
}
