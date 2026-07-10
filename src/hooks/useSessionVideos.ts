'use client'

import { useCallback, useEffect, useState } from 'react'

import type { SessionVideo } from '@/types/sessionVideo.types'

interface UseSessionVideosReturn {
  videos: SessionVideo[]
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useSessionVideos = (): UseSessionVideosReturn => {
  const [videos, setVideos] = useState<SessionVideo[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/session-videos')
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to load videos')
      setVideos(body.videos ?? [])
      setIsAdmin(Boolean(body.isAdmin))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { videos, isAdmin, isLoading, error, refetch }
}
