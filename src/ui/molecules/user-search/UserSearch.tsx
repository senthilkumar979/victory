import { supabase } from '@/lib/supabaseClient'
import type { ProfileData } from '@/types/student.types'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FormInput } from '../form-input/FormInput'
import type { UserSearchProps } from './UserSearch.types'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 250
const MAX_RESULTS = 5

export const UserSearch: React.FC<UserSearchProps> = ({
  onSelect,
  placeholder = 'Search students by name...',
  className,
  autoFocus,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProfileData[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [highlightIndex, setHighlightIndex] = useState<number>(-1)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const trimmedQuery = query.trim()
  const isQueryTooShort =
    trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH

  const showDropdown = useMemo(
    () =>
      isOpen && (isLoading || !!error || results.length > 0 || isQueryTooShort),
    [isOpen, isLoading, error, results.length, isQueryTooShort],
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return
      if (
        event.target instanceof Node &&
        containerRef.current.contains(event.target)
      )
        return
      setIsOpen(false)
      setHighlightIndex(-1)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    if (trimmedQuery.length < MIN_QUERY_LENGTH) {
      setResults([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    timeoutRef.current = window.setTimeout(async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('students')
          .select(
            'id, name, picture, role, company, email, social_links, batch',
          )
          .ilike('name', `%${trimmedQuery}%`)
          .limit(MAX_RESULTS)

        if (fetchError) throw fetchError

        const mapped: ProfileData[] =
          data?.map((student) => ({
            id: student.id,
            name: student.name,
            picture: student.picture,
            role: student.role,
            company: student.company,
            email: student.email,
            socialLinks: student.social_links ?? undefined,
            batch: student.batch,
          })) ?? []

        setResults(mapped)
        setHighlightIndex(mapped.length ? 0 : -1)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to search students',
        )
        setResults([])
        setHighlightIndex(-1)
      } finally {
        setIsLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [trimmedQuery])

  const handleSelect = (student: ProfileData) => {
    onSelect(student)
    setQuery(student.name)
    setIsOpen(false)
    setHighlightIndex(-1)
  }

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event,
  ) => {
    if (!results.length) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlightIndex((prev) => (prev + 1) % results.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlightIndex((prev) => (prev - 1 + results.length) % results.length)
      return
    }

    if (
      event.key === 'Enter' &&
      highlightIndex >= 0 &&
      highlightIndex < results.length
    ) {
      event.preventDefault()
      handleSelect(results[highlightIndex])
      return
    }

    if (event.key === 'Escape') {
      setIsOpen(false)
      setHighlightIndex(-1)
    }
  }

  return (
    <div
      ref={containerRef}
      className={
        className
          ? `relative w-full max-w-md ${className}`
          : 'relative w-full max-w-md'
      }
    >
      <div className="group flex items-center gap-2 rounded-xl">
        <FormInput
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          label={undefined}
        />
      </div>

      {showDropdown && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="max-h-72 overflow-y-auto">
            {isQueryTooShort && (
              <div className="px-4 py-3 text-xs text-slate-400">
                Type at least {MIN_QUERY_LENGTH} characters to search students.
              </div>
            )}

            {isLoading && !isQueryTooShort && (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                Searching students…
              </div>
            )}

            {error && !isLoading && (
              <div className="px-4 py-3 text-xs text-red-400">{error}</div>
            )}

            {!isLoading &&
              !error &&
              !isQueryTooShort &&
              results.length === 0 && (
                <div className="px-4 py-3 text-xs text-slate-400">
                  No students found for &quot;{trimmedQuery}&quot;.
                </div>
              )}

            {results.map((student, index) => {
              const isHighlighted = index === highlightIndex
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelect(student)}
                  className={[
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition',
                    isHighlighted
                      ? 'bg-gradient-to-r from-violet-600/70 to-sky-500/60 text-slate-50'
                      : 'bg-transparent text-slate-100 hover:bg-slate-800/80',
                  ].join(' ')}
                >
                  {student.picture ? (
                    <img
                      src={student.picture}
                      alt={student.name}
                      className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-2 ring-slate-900/80"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-sky-500 text-xs font-semibold text-slate-950">
                      {student.name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part.charAt(0).toUpperCase())
                        .join('')}
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {student.name}
                    </span>
                    <span className="truncate text-xs text-slate-300">
                      {student.role}
                      {student.company ? ` • ${student.company}` : ''}
                    </span>
                    <span className="truncate text-[11px] text-slate-400">
                      {student.email} · Batch {student.batch}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
