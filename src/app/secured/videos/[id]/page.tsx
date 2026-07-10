'use client'

import { use } from 'react'

import { useCheckIsAuthenticated } from '@/hooks/useCheckIsAuthenticated'
import { VideosWatchPage } from '@/app/modules/Videos/VideosWatchPage'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function SecuredVideoWatchPage({ params }: PageProps) {
  useCheckIsAuthenticated()
  const { id } = use(params)
  return <VideosWatchPage videoId={id} />
}
