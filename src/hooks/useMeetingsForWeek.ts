'use client'

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

import type { MeetingFormState } from '@/app/modules/Meetings/Meeting.types'

const MEETINGS_TABLE = 'meetings'
const SELECT_COLS =
  'id, title, date, google_group_id, description, meeting_link, cover_image_url'
const IST_TIMEZONE = 'Asia/Kolkata'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

export interface WeekDay {
  key: string
  label: string
  date: Date
  dayName: (typeof DAY_NAMES)[number]
}

export interface UseMeetingsForWeekReturn {
  weekDays: WeekDay[]
  meetingsByDay: Record<string, MeetingFormState[]>
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

function mapRow(row: Record<string, unknown>): MeetingFormState {
  return {
    id: row.id as string,
    title: (row.title as string) ?? '',
    date: (row.date as string) ?? '',
    googleGroupId: (row.google_group_id as string) ?? '',
    description: (row.description as string) ?? '',
    meetingLink: (row.meeting_link as string) ?? '',
    coverImageUrl: (row.cover_image_url as string) ?? '',
  }
}

function getWeekBounds(): { start: Date; end: Date; weekDays: WeekDay[] } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(now)

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '0'
  const year = Number(get('year'))
  const month = Number(get('month'))
  const day = Number(get('day'))
  const weekday = get('weekday')

  const weekdayToOffset: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  }
  const daysFromMonday = weekdayToOffset[weekday] ?? 0
  const monDay = day - daysFromMonday

  const mondayDate = new Date(year, month - 1, monDay)
  const sundayDate = new Date(mondayDate)
  sundayDate.setDate(sundayDate.getDate() + 6)

  const start = new Date(mondayDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(sundayDate)
  end.setHours(23, 59, 59, 999)

  const weekDays = buildWeekDaysFromMonday(mondayDate)
  return { start, end, weekDays }
}

function buildWeekDaysFromMonday(monday: Date): WeekDay[] {
  const dayNames: (typeof DAY_NAMES)[number][] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ]
  const days: WeekDay[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = d.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE })
    const pad = (n: number) => n.toString().padStart(2, '0')
    const day = d.getDate()
    const month = d.getMonth() + 1
    days.push({
      key,
      label: `${dayNames[i]} ${pad(day)}/${pad(month)}`,
      date: d,
      dayName: dayNames[i],
    })
  }
  return days
}

function getDateKeyFromISO(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-CA', { timeZone: IST_TIMEZONE })
}

export const useMeetingsForWeek = (): UseMeetingsForWeekReturn => {
  const [meetingsByDay, setMeetingsByDay] = useState<
    Record<string, MeetingFormState[]>
  >({})
  const [weekDays, setWeekDays] = useState<WeekDay[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { start, end, weekDays: days } = getWeekBounds()
      setWeekDays(days)

      const { data, error: fetchError } = await supabase
        .from(MEETINGS_TABLE)
        .select(SELECT_COLS)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())
        .order('date', { ascending: true })

      if (fetchError) throw fetchError
      const meetings = (data ?? []).map(mapRow)
      const byDay: Record<string, MeetingFormState[]> = {}
      for (const day of days) byDay[day.key] = []
      for (const m of meetings) {
        const key = getDateKeyFromISO(m.date)
        if (byDay[key]) byDay[key].push(m)
      }
      setMeetingsByDay(byDay)
    } catch (err) {
      console.error('Error fetching meetings for week:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  return { weekDays, meetingsByDay, isLoading, error, refetch: fetchMeetings }
}
