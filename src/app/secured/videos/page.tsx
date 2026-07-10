'use client'

import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { VideosBrowsePage } from '@/app/modules/Videos/VideosBrowsePage'

export default function SecuredVideosPage() {
  useCheckIsAuthenticated()
  return <VideosBrowsePage />
}
