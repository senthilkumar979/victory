'use client'

import { SESSION_VIDEO_CATEGORY_OPTIONS } from '@/lib/sessionVideos/sessionVideoCategories'
import type { VideoBrowseFilters, VideoSortOption } from '@/lib/sessionVideos/videoBrowseFilters'

interface VideoSearchFiltersProps {
  filters: VideoBrowseFilters
  onChange: (filters: VideoBrowseFilters) => void
  resultCount?: number
}

export const VideoSearchFilters = ({
  filters,
  onChange,
  resultCount,
}: VideoSearchFiltersProps) => {
  const update = (patch: Partial<VideoBrowseFilters>) =>
    onChange({ ...filters, ...patch })

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => update({ query: e.target.value })}
          placeholder="Search videos by title..."
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <select
          value={filters.category}
          onChange={(e) =>
            update({
              category: e.target.value as VideoBrowseFilters['category'],
            })
          }
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100"
        >
          <option value="all">All categories</option>
          {SESSION_VIDEO_CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as VideoSortOption })}
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-slate-100"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="views">Sort: Most viewed</option>
          <option value="newest">Sort: Newest</option>
        </select>
      </div>
      {resultCount != null && (
        <p className="text-sm text-slate-400">
          {resultCount} video{resultCount === 1 ? '' : 's'} found
        </p>
      )}
    </div>
  )
}
