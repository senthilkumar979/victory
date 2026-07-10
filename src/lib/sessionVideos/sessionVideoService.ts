import 'server-only'

import type { SessionVideo } from '@/types/sessionVideo.types'
import type { SessionVideoCategory } from '@/lib/sessionVideos/sessionVideoCategories'
import { parseYoutubeVideoId } from '@/lib/sessionVideos/youtubeUtils'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function mapSessionVideo(row: Record<string, unknown>): SessionVideo {
  return {
    id: row.id as string,
    title: row.title as string,
    youtubeUrl: row.youtube_url as string,
    youtubeVideoId: row.youtube_video_id as string,
    category: row.category as SessionVideoCategory,
    isFeatured: Boolean(row.is_featured),
    viewCount: (row.view_count as number) ?? 0,
    createdBy: row.created_by as string,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

function getDb() {
  const db = supabaseAdmin
  if (!db) throw new Error('Server database is not configured.')
  return db
}

export async function listSessionVideos(): Promise<SessionVideo[]> {
  const { data, error } = await getDb()
    .from('session_videos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(mapSessionVideo)
}

export async function getSessionVideoById(
  id: string,
): Promise<SessionVideo | null> {
  const { data, error } = await getDb()
    .from('session_videos')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data ? mapSessionVideo(data) : null
}

export async function createSessionVideo(input: {
  title: string
  youtubeUrl: string
  category: SessionVideoCategory
  isFeatured: boolean
  createdBy: string
}): Promise<SessionVideo> {
  const videoId = parseYoutubeVideoId(input.youtubeUrl)
  if (!videoId) throw new Error('Invalid YouTube URL')

  const { data, error } = await getDb()
    .from('session_videos')
    .insert({
      title: input.title,
      youtube_url: input.youtubeUrl,
      youtube_video_id: videoId,
      category: input.category,
      is_featured: input.isFeatured,
      created_by: input.createdBy,
    })
    .select('*')
    .single()

  if (error) throw error
  return mapSessionVideo(data)
}

export async function updateSessionVideo(
  id: string,
  input: {
    title: string
    youtubeUrl: string
    category: SessionVideoCategory
    isFeatured: boolean
  },
): Promise<SessionVideo> {
  const videoId = parseYoutubeVideoId(input.youtubeUrl)
  if (!videoId) throw new Error('Invalid YouTube URL')

  const { data, error } = await getDb()
    .from('session_videos')
    .update({
      title: input.title,
      youtube_url: input.youtubeUrl,
      youtube_video_id: videoId,
      category: input.category,
      is_featured: input.isFeatured,
    })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return mapSessionVideo(data)
}

export async function deleteSessionVideo(id: string): Promise<void> {
  const { error } = await getDb().from('session_videos').delete().eq('id', id)
  if (error) throw error
}

export async function incrementSessionVideoViewCount(
  id: string,
): Promise<SessionVideo | null> {
  const existing = await getSessionVideoById(id)
  if (!existing) return null

  const { data, error } = await getDb()
    .from('session_videos')
    .update({ view_count: existing.viewCount + 1 })
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return mapSessionVideo(data)
}
