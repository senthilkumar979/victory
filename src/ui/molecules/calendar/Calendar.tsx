'use client'

import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { joinClassNames } from '@/utils/tailwindUtils'

interface CalendarProps {
  selected?: Date
  onSelect: (date: Date | undefined) => void
  isDarkMode?: boolean
  className?: string
}

const rootLight =
  'rounded-xl border border-slate-200 bg-white p-3 shadow-sm min-w-0 w-full max-w-[min(100%,22rem)] overflow-hidden box-border ' +
  '[--cell-size:2.25rem] sm:p-4 sm:[--cell-size:2.5rem]'
const rootDark =
  'rounded-xl border border-slate-700/80 bg-slate-900/95 p-3 shadow-lg shadow-black/20 min-w-0 w-full max-w-[min(100%,22rem)] overflow-hidden box-border ' +
  '[--cell-size:2.25rem] sm:p-4 sm:[--cell-size:2.5rem]'

export const Calendar = ({
  selected,
  onSelect,
  isDarkMode = false,
  className,
}: CalendarProps) => {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      showOutsideDays
      ISOWeek
      className={joinClassNames(
        'w-full max-w-full font-medium',
        isDarkMode ? rootDark : rootLight,
        className,
      )}
      classNames={{
        months: 'flex flex-col min-w-0',
        month: 'flex flex-col gap-4 min-w-0 max-w-full',
        month_caption:
          'flex items-center justify-between px-0.5 pb-2 sm:px-1 sm:pb-3 relative',
        nav: 'flex items-center gap-0.5',
        button_previous: joinClassNames(
          'inline-flex size-8 min-w-[2.5rem] min-h-[2.5rem] sm:size-9 items-center justify-center rounded-lg text-slate-500 transition-colors touch-manipulation',
          'hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDarkMode &&
            'text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:ring-offset-slate-900',
        ),
        button_next: joinClassNames(
          'inline-flex size-8 min-w-[2.5rem] min-h-[2.5rem] sm:size-9 items-center justify-center rounded-lg text-slate-500 transition-colors touch-manipulation',
          'hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDarkMode &&
            'text-slate-400 hover:bg-slate-800 hover:text-slate-200 focus-visible:ring-offset-slate-900',
        ),
        caption_label: joinClassNames(
          'text-xs font-semibold tabular-nums sm:text-sm',
          isDarkMode ? 'text-slate-100' : 'text-slate-800',
        ),
        weekdays: 'flex w-full gap-0.5',
        weekday: joinClassNames(
          'flex-[0_0_var(--cell-size)] w-[var(--cell-size)] min-w-[var(--cell-size)] max-w-[var(--cell-size)] text-center text-[0.6rem] font-semibold uppercase tracking-wider sm:text-[0.65rem]',
          isDarkMode ? 'text-slate-500' : 'text-slate-400',
        ),
        week: 'flex w-full min-w-0 gap-0.5 mt-0.5 sm:mt-1',
        day:
          'flex-[0_0_var(--cell-size)] size-[var(--cell-size)] min-w-[var(--cell-size)] min-h-[var(--cell-size)] max-w-[var(--cell-size)] p-0 text-center',
        day_button: joinClassNames(
          'inline-flex size-full items-center justify-center rounded-lg text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 touch-manipulation sm:text-sm',
          'hover:bg-slate-100 hover:text-slate-900',
          'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:shadow-sm data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground',
          isDarkMode &&
            [
              'hover:bg-slate-700 hover:text-slate-100',
              'data-[selected]:bg-primary data-[selected]:text-primary-foreground',
            ].join(' '),
        ),
        outside: joinClassNames(
          'opacity-40 aria-selected:opacity-40',
          isDarkMode ? 'text-slate-500' : 'text-slate-400',
        ),
        disabled: 'opacity-30 cursor-not-allowed',
        hidden: 'invisible',
        today: joinClassNames(
          'rounded-lg ring-2 ring-offset-2',
          isDarkMode
            ? 'ring-amber-500/60 ring-offset-slate-900'
            : 'ring-amber-400 ring-offset-white',
        ),
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
          ) : (
            <ChevronRight className="size-4 shrink-0" aria-hidden />
          ),
      }}
    />
  )
}
