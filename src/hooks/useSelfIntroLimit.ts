'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'self-intro-generation-count'
const MAX_PER_DAY = 2

interface SelfIntroStorage {
  date: string
  count: number
}

function getTodayDateString(): string {
  return new Date().toDateString()
}

function readStored(): SelfIntroStorage {
  if (typeof window === 'undefined')
    return { date: getTodayDateString(), count: 0 }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { date: getTodayDateString(), count: 0 }
    const parsed = JSON.parse(raw) as SelfIntroStorage
    if (
      typeof parsed.date !== 'string' ||
      typeof parsed.count !== 'number'
    )
      return { date: getTodayDateString(), count: 0 }
    return parsed
  } catch {
    return { date: getTodayDateString(), count: 0 }
  }
}

function getCountForToday(): number {
  const stored = readStored()
  const today = getTodayDateString()
  return stored.date === today ? stored.count : 0
}

export const useSelfIntroLimit = () => {
  const [count, setCount] = useState(0)
  const hasSynced = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || hasSynced.current) return
    hasSynced.current = true
    setCount(getCountForToday())
  }, [])

  const canGenerate = count < MAX_PER_DAY
  const remaining = Math.max(0, MAX_PER_DAY - count)

  const incrementCount = useCallback(() => {
    if (typeof window === 'undefined') return
    const stored = readStored()
    const todayStr = getTodayDateString()
    const newCount = stored.date === todayStr ? stored.count + 1 : 1
    const next: SelfIntroStorage = { date: todayStr, count: newCount }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setCount(newCount)
  }, [])

  return { canGenerate, remaining, incrementCount }
}
