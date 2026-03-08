'use client'

import { CalendarIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { dateToISTParts } from '@/utils/dateISTUtils'
import { joinClassNames } from '@/utils/tailwindUtils'

import { Calendar } from './Calendar'

/** Parse value as date or datetime (ISO); returns Date or undefined */
function parseValue(value: string): Date | undefined {
  if (!value?.trim()) return undefined
  const trimmed = value.trim()
  const parsed = new Date(trimmed)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed
}

/** Format Date to ISO string in IST (YYYY-MM-DDTHH:mm:ss+05:30) for form value */
function toISTISOString(date: Date): string {
  const p = dateToISTParts(date)
  const y = p.y
  const m = (p.m + 1).toString().padStart(2, '0')
  const d = p.d.toString().padStart(2, '0')
  const h = p.h.toString().padStart(2, '0')
  const min = p.min.toString().padStart(2, '0')
  return `${y}-${m}-${d}T${h}:${min}:00+05:30`
}

/** Format Date for display: "MMM d, yyyy, HH:mm" in IST (24h) */
function formatDisplayIST(date: Date): string {
  const p = dateToISTParts(date)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const mon = months[p.m]
  const h = p.h.toString().padStart(2, '0')
  const min = p.min.toString().padStart(2, '0')
  return `${mon} ${p.d}, ${p.y}, ${h}:${min}`
}

interface CalendarInputProps {
  id?: string
  label?: React.ReactNode
  value: string
  onChange: (dateString: string) => void
  isDarkMode?: boolean
  placeholder?: string
  className?: string
}

const inputBase =
  'block w-full rounded-md border px-3 py-2 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0.25 ' +
  'cursor-pointer'

export const CalendarInput = ({
  id,
  label = 'Date & time',
  value,
  onChange,
  isDarkMode = false,
  placeholder = 'Select date and time (IST)',
  className,
}: CalendarInputProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  const selectedDate = useMemo(() => parseValue(value), [value])

  const displayValue = useMemo(() => {
    if (!selectedDate) return ''
    try {
      return formatDisplayIST(selectedDate)
    } catch {
      return value
    }
  }, [selectedDate, value])

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) {
        onChange('')
      } else {
        onChange(toISTISOString(date))
      }
      setIsOpen(false)
    },
    [onChange],
  )

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (wrapperRef.current?.contains(target)) return
      setIsOpen(false)
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside, true)
    document.addEventListener('touchstart', handleClickOutside, {
      passive: true,
      capture: true,
    })
    document.addEventListener('keydown', handleEscape, true)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true)
      document.removeEventListener('touchstart', handleClickOutside, true)
      document.removeEventListener('keydown', handleEscape, true)
    }
  }, [isOpen])

  const inputId =
    id ??
    (typeof label === 'string'
      ? label.replace(/\s+/g, '-').toLowerCase()
      : 'date')

  return (
    <div ref={wrapperRef} className={joinClassNames('relative', className)}>
      {label && (
        <FormLabel
          htmlFor={inputId}
          isDarkMode={isDarkMode}
          className="mb-1.5 block"
        >
          {label}
        </FormLabel>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          readOnly
          value={displayValue}
          placeholder={placeholder}
          aria-haspopup="dialog"
          aria-label={typeof label === 'string' ? label : 'Date'}
          className={joinClassNames(
            inputBase,
            'border-input focus-visible:ring-primary pr-9',
            isDarkMode
              ? 'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500'
              : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
          )}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
        />
        <span
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500"
          aria-hidden
        >
          <CalendarIcon className="size-4" />
        </span>
      </div>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 opacity-100 bg-black">
          <Calendar
            selected={selectedDate}
            onSelect={handleSelect}
            isDarkMode={isDarkMode}
          />
        </div>
      )}
    </div>
  )
}
