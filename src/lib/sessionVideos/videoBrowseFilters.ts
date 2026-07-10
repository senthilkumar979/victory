import type { SessionVideo } from '@/types/sessionVideo.types'
import type { SessionVideoCategory } from '@/lib/sessionVideos/sessionVideoCategories'
import { buildVideoBrowseSections } from '@/lib/sessionVideos/sessionVideoUtils'

export type VideoSortOption = 'relevance' | 'views' | 'newest'

export interface VideoBrowseFilters {
  query: string
  category: SessionVideoCategory | 'all'
  sort: VideoSortOption
}

export const DEFAULT_VIDEO_BROWSE_FILTERS: VideoBrowseFilters = {
  query: '',
  category: 'all',
  sort: 'relevance',
}

export function isVideoBrowseFilterActive(filters: VideoBrowseFilters): boolean {
  return (
    filters.query.trim().length > 0 ||
    filters.category !== 'all' ||
    filters.sort !== 'relevance'
  )
}

function matchesQuery(video: SessionVideo, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return video.title.toLowerCase().includes(q)
}

function sortVideos(videos: SessionVideo[], sort: VideoSortOption, query: string) {
  const list = [...videos]
  if (sort === 'views') {
    return list.sort((a, b) => b.viewCount - a.viewCount)
  }
  if (sort === 'newest') {
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }
  if (query.trim()) {
    const q = query.trim().toLowerCase()
    return list.sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(q) ? 0 : 1
      const bStarts = b.title.toLowerCase().startsWith(q) ? 0 : 1
      if (aStarts !== bStarts) return aStarts - bStarts
      return a.title.localeCompare(b.title)
    })
  }
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function filterSessionVideos(
  videos: SessionVideo[],
  filters: VideoBrowseFilters,
): SessionVideo[] {
  let result = videos.filter((v) => matchesQuery(v, filters.query))
  if (filters.category !== 'all') {
    result = result.filter((v) => v.category === filters.category)
  }
  return sortVideos(result, filters.sort, filters.query)
}

export function getVideoBrowseView(
  videos: SessionVideo[],
  filters: VideoBrowseFilters,
) {
  if (isVideoBrowseFilterActive(filters)) {
    return {
      mode: 'search' as const,
      results: filterSessionVideos(videos, filters),
    }
  }

  return {
    mode: 'browse' as const,
    ...buildVideoBrowseSections(videos),
  }
}
