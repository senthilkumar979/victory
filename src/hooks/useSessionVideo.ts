'use client'

import { useCallback, useEffect, useState } from 'react'

import type { SessionVideo } from '@/types/sessionVideo.types'

interface UseSessionVideoReturn {
  video: SessionVideo | null
  isAdmin: boolean
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useSessionVideo = (id: string): UseSessionVideoReturn => {
  const [video, setVideo] = useState<SessionVideo | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    if (!id) return
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch(`/api/session-videos/${id}`)
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to load video')
      setVideo(body.video ?? null)
      setIsAdmin(Boolean(body.isAdmin))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load video')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { video, isAdmin, isLoading, error, refetch }
}
