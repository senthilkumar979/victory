import type { SessionVideo } from '@/types/sessionVideo.types'
import {
  SESSION_VIDEO_CATEGORY_OPTIONS,
  type SessionVideoCategory,
} from '@/lib/sessionVideos/sessionVideoCategories'

export function getSimilarVideos(
  videos: SessionVideo[],
  currentId: string,
  limit = 12,
): SessionVideo[] {
  const current = videos.find((v) => v.id === currentId)
  if (!current) {
    return videos.filter((v) => v.id !== currentId).slice(0, limit)
  }

  const sameCategory = videos.filter(
    (v) => v.id !== currentId && v.category === current.category,
  )
  const others = videos.filter(
    (v) => v.id !== currentId && v.category !== current.category,
  )

  return [...sameCategory, ...others].slice(0, limit)
}

export interface VideoBrowseSections {
  featured: SessionVideo | null
  mostViewed: SessionVideo[]
  recent: SessionVideo[]
  byCategory: { value: SessionVideoCategory; label: string; videos: SessionVideo[] }[]
}

function excludeByIds(
  videos: SessionVideo[],
  excludeIds: ReadonlySet<string>,
): SessionVideo[] {
  return videos.filter((v) => !excludeIds.has(v.id))
}

/** Build browse rows without repeating the same video across sections. */
export function buildVideoBrowseSections(videos: SessionVideo[]): VideoBrowseSections {
  const shown = new Set<string>()

  const flagged = videos.filter((v) => v.isFeatured)
  const featured =
    flagged[0] ??
    [...videos].sort((a, b) => b.viewCount - a.viewCount)[0] ??
    null

  if (featured) shown.add(featured.id)

  const mostViewed = excludeByIds(videos, shown)
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 12)
  mostViewed.forEach((v) => shown.add(v.id))

  const recent = excludeByIds(videos, shown)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 12)
  recent.forEach((v) => shown.add(v.id))

  const byCategory = SESSION_VIDEO_CATEGORY_OPTIONS.map((cat) => ({
    value: cat.value,
    label: cat.label,
    videos: excludeByIds(videos, shown)
      .filter((v) => v.category === cat.value)
      .slice(0, 12),
  })).filter((g) => g.videos.length > 0)

  return { featured, mostViewed, recent, byCategory }
}
