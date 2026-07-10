'use client'

import { useEffect } from 'react'

export function useRecordVideoView(videoId: string | undefined) {
  useEffect(() => {
    if (!videoId) return

    const key = `video-view-${videoId}`
    if (sessionStorage.getItem(key)) return

    fetch(`/api/session-videos/${videoId}/view`, { method: 'POST' })
      .then(() => sessionStorage.setItem(key, '1'))
      .catch(() => undefined)
  }, [videoId])
}
