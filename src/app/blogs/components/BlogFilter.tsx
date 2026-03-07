'use client'

interface BlogFilterProps {
  authors: string[]
  value: string | null
  onChange: (author: string | null) => void
  disabled?: boolean
}

export function BlogFilter({
  authors,
  value,
  onChange,
  disabled = false,
}: BlogFilterProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-medium text-slate-700">Author</span>
      <select
        value={value ?? ''}
        onChange={(e) =>
          onChange(e.target.value ? e.target.value : null)
        }
        disabled={disabled}
        aria-label="Filter by author"
        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
      >
        <option value="">All Authors</option>
        {authors.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}
