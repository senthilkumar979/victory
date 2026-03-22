'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Search, Sparkles, X } from 'lucide-react'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import {
  filterAuthorsByPrefix,
  MAX_AUTHOR_SUGGESTIONS,
} from './blogAuthorFilter'

interface BlogFilterProps {
  authors: string[]
  value: string | null
  onChange: (author: string | null) => void
  disabled?: boolean
}

const copy = {
  label: 'Find a writer',
  placeholder: 'Search by name…',
  hintTitle: '',
  hintBody: `Type the starting letters of a writer’s name.`,
  allWriters: 'View all writers',
  noMatches: (q: string) =>
    `No writers match “${q}”. Try a shorter fragment or check the spelling.`,
  clear: 'Clear search',
} as const

export function BlogFilter({
  authors,
  value,
  onChange,
  disabled = false,
}: BlogFilterProps) {
  const id = useId()
  const listId = `${id}-list`
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)

  const displayValue = isFocused ? query : value ?? ''

  const suggestions = useMemo(
    () => filterAuthorsByPrefix(authors, displayValue),
    [authors, displayValue],
  )

  const hasQuery = displayValue.trim().length > 0
  const showClear = Boolean(value || displayValue.trim())

  const listItems = useMemo(() => {
    const items: { key: string; label: string; value: string | null }[] = [
      { key: 'all', label: copy.allWriters, value: null },
    ]
    for (const name of suggestions) {
      items.push({ key: name, label: name, value: name })
    }
    return items
  }, [suggestions])

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const select = useCallback(
    (author: string | null) => {
      onChange(author)
      setQuery(author ?? '')
      setOpen(false)
      inputRef.current?.blur()
    },
    [onChange],
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true)
      setHighlight(0)
      return
    }
    if (!open || listItems.length === 0) {
      if (e.key === 'Escape') setOpen(false)
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => (h + 1) % listItems.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => (h - 1 + listItems.length) % listItems.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = listItems[highlight]
      if (item) select(item.value)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2 sm:max-w-lg">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Filter
        </span>
        <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
      </div>
      <p className="text-sm font-semibold tracking-tight text-slate-900">
        {copy.label}
      </p>

      <div
        ref={containerRef}
        className="relative w-full min-w-[min(100%,18rem)]"
      >
        <label htmlFor={`${id}-input`} className="sr-only">
          {copy.label}
        </label>

        <div
          className={cn(
            'group relative rounded-2xl bg-gradient-to-br from-white via-white to-pink-50/30 p-[1px] shadow-[0_1px_0_rgba(15,23,42,0.04)] transition-shadow duration-300',
            'ring-1 ring-slate-200/90',
            open && 'shadow-lg shadow-primary/10 ring-primary/25',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <div className="relative flex items-center overflow-hidden rounded-[15px] bg-white/95 backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-11 bg-gradient-to-r from-slate-50/90 to-transparent" />
            <Search
              className="relative z-[1] ml-3.5 h-[18px] w-[18px] shrink-0 text-primary/70"
              aria-hidden
            />
            <input
              ref={inputRef}
              id={`${id}-input`}
              type="text"
              role="combobox"
              aria-expanded={open}
              aria-controls={listId}
              aria-autocomplete="list"
              autoComplete="off"
              spellCheck={false}
              disabled={disabled}
              placeholder={copy.placeholder}
              value={displayValue}
              onChange={(e) => {
                setQuery(e.target.value)
                setHighlight(0)
                setOpen(true)
              }}
              onFocus={() => {
                setIsFocused(true)
                setQuery(value ?? '')
                setHighlight(0)
                setOpen(true)
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={onKeyDown}
              className="relative z-[1] w-full min-w-0 bg-transparent py-3 pl-3 pr-11 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {showClear ? (
              <button
                type="button"
                onClick={() => select(null)}
                className="absolute right-2 top-1/2 z-[1] -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={copy.clear}
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {open && !disabled && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.99 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-50 mt-2 w-full origin-top"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_24px_48px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-900/[0.04] backdrop-blur-md">
                <div className="h-0.5 w-full bg-gradient-to-r from-primary/80 via-pink-400/60 to-violet-400/40" />

                <ul
                  id={listId}
                  role="listbox"
                  className="max-h-[min(20rem,55vh)] overflow-auto py-1.5"
                >
                  {!hasQuery ? (
                    <li className="border-b border-slate-100/90 px-4 pb-3 pt-2">
                      <div className="flex gap-3">
                        <div>
                          <p className="mt-1 text-sm leading-relaxed text-slate-600">
                            {copy.hintBody}
                          </p>
                        </div>
                      </div>
                    </li>
                  ) : null}
                  {hasQuery && suggestions.length === 0 ? (
                    <li className="border-b border-slate-100/90 px-4 py-3">
                      <div className="flex gap-3">
                        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <BookOpen className="h-4 w-4" aria-hidden />
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                          {copy.noMatches(displayValue.trim())}
                        </p>
                      </div>
                    </li>
                  ) : null}

                  {listItems.map((item, index) => (
                    <li key={item.key} role="presentation" className="px-1.5">
                      <button
                        type="button"
                        role="option"
                        aria-selected={highlight === index}
                        className={cn(
                          'flex w-full rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors duration-150',
                          highlight === index
                            ? 'bg-primary/12 text-primary shadow-sm'
                            : 'text-slate-800 hover:bg-slate-50',
                          item.value === null && 'font-medium text-slate-700',
                        )}
                        onMouseEnter={() => setHighlight(index)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => select(item.value)}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
