'use client'

import { Card, Select } from '@/app/blogs/components'

interface BlogsToolbarProps {
  authorFilter: string | null
  setAuthorFilter: (author: string | null) => void
  authors: string[]
  from: number
  to: number
  totalCount: number
}

export function BlogsToolbar({
  authorFilter,
  setAuthorFilter,
  authors,
  from,
  to,
  totalCount,
}: BlogsToolbarProps) {
  return (
    <Card className="flex flex-wrap items-center gap-4 p-4">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        Author
        <Select
          id="author-filter"
          value={authorFilter ?? ''}
          onChange={(e) =>
            setAuthorFilter(e.target.value ? e.target.value : null)
          }
          aria-label="Filter by author"
        >
          <option value="">All authors</option>
          {authors.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
      </label>
      {totalCount > 0 && (
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {from}–{to} of {totalCount}
        </span>
      )}
    </Card>
  )
}
