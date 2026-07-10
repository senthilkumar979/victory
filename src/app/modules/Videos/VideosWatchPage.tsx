'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { VideoCard } from '@/components/video/VideoCard'
import { YouTubeEmbed } from '@/components/video/YouTubeEmbed'
import { useRecordVideoView } from '@/hooks/useRecordVideoView'
import { useSessionVideo } from '@/hooks/useSessionVideo'
import { useSessionVideos } from '@/hooks/useSessionVideos'
import { getSessionVideoCategoryLabel } from '@/lib/sessionVideos/sessionVideoCategories'
import { formatViewCount } from '@/lib/sessionVideos/youtubeUtils'
import { getSimilarVideos } from '@/lib/sessionVideos/sessionVideoUtils'

interface VideosWatchPageProps {
  videoId: string
}

export const VideosWatchPage = ({ videoId }: VideosWatchPageProps) => {
  const { video, isLoading, error } = useSessionVideo(videoId)
  const { videos: allVideos } = useSessionVideos()
  useRecordVideoView(video?.id)

  const similar = useMemo(
    () => (video ? getSimilarVideos(allVideos, video.id, 16) : []),
    [allVideos, video],
  )

  const sidebarSimilar = similar.slice(0, 8)
  const belowSimilar = similar.slice(0, 12)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-6">
        <div className="mx-auto max-w-7xl animate-pulse">
          <div className="aspect-video rounded-xl bg-slate-800" />
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8">
        <p className="text-red-300">{error ?? 'Video not found.'}</p>
        <Link href="/secured/videos" className="mt-4 inline-flex text-primary hover:underline">
          Back to videos
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-4 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/secured/videos"
          className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to videos
        </Link>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-4">
            <YouTubeEmbed videoId={video.youtubeVideoId} title={video.title} />
            <div>
              <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
                {video.title}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {formatViewCount(video.viewCount)} ·{' '}
                {getSessionVideoCategoryLabel(video.category)}
              </p>
            </div>
          </div>

          <aside className="hidden xl:block">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Similar videos
            </h2>
            <div className="space-y-1">
              {sidebarSimilar.map((v) => (
                <VideoCard key={v.id} video={v} layout="horizontal" />
              ))}
            </div>
          </aside>
        </div>

        <section className="mt-10 xl:hidden">
          <h2 className="mb-3 text-lg font-semibold text-slate-100">Similar videos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {belowSimilar.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>

        <section className="mt-10 hidden xl:block">
          <h2 className="mb-4 text-lg font-semibold text-slate-100">More like this</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {belowSimilar.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
