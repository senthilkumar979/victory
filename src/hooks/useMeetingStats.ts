'use client'

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabaseClient'

const MEETINGS_TABLE = 'meetings'
const IST_TIMEZONE = 'Asia/Kolkata'

function getMonthBounds(): { start: string; end: string } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '0'
  const year = Number(get('year'))
  const month = Number(get('month'))
  const lastDay = new Date(year, month, 0).getDate()
  const pad = (n: number) => n.toString().padStart(2, '0')

  return {
    start: `${year}-${pad(month)}-01T00:00:00+05:30`,
    end: `${year}-${pad(month)}-${pad(lastDay)}T23:59:59.999+05:30`,
  }
}

function getWeekBounds(): { start: string; end: string } {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-IN', {
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
  const start = new Date(year, month - 1, monDay)
  const end = new Date(year, month - 1, monDay + 6)
  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

interface UseMeetingStatsReturn {
  totalMeetings: number
  meetingsThisMonth: number
  meetingsThisWeek: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useMeetingStats = (): UseMeetingStatsReturn => {
  const [totalMeetings, setTotalMeetings] = useState(0)
  const [meetingsThisMonth, setMeetingsThisMonth] = useState(0)
  const [meetingsThisWeek, setMeetingsThisWeek] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [{ count: total }, { count: thisMonth }, {count: thisWeek}] = await Promise.all([
        supabase.from(MEETINGS_TABLE).select('*', { count: 'exact', head: true }),
        (() => {
          const { start, end } = getMonthBounds()
          return supabase
            .from(MEETINGS_TABLE)
            .select('*', { count: 'exact', head: true })
            .gte('date', start)
            .lte('date', end)
        })(),
        (() => {
          const { start, end } = getWeekBounds()
          return supabase
            .from(MEETINGS_TABLE)
            .select('*', { count: 'exact', head: true })
            .gte('date', start)
            .lte('date', end)
        })(),
      ])

      setTotalMeetings(total ?? 0)
      setMeetingsThisMonth(thisMonth ?? 0)
      setMeetingsThisWeek(thisWeek ?? 0)
    } catch (err) {
      console.error('Error fetching meeting stats:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch meeting stats',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    totalMeetings,
    meetingsThisMonth,
    meetingsThisWeek,
    isLoading,
    error,
    refetch: fetchStats,
  }
}
