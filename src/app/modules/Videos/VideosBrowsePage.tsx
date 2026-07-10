'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play } from 'lucide-react'

import { VideoRow } from '@/components/video/VideoRow'
import { useSessionVideos } from '@/hooks/useSessionVideos'
import { getSessionVideoCategoryLabel } from '@/lib/sessionVideos/sessionVideoCategories'
import { buildVideoBrowseSections } from '@/lib/sessionVideos/sessionVideoUtils'
import {
  formatViewCount,
  getYoutubeThumbnailUrl,
} from '@/lib/sessionVideos/youtubeUtils'

export const VideosBrowsePage = () => {
  const { videos, isLoading, error } = useSessionVideos()

  const { featured, mostViewed, recent, byCategory } = useMemo(
    () => buildVideoBrowseSections(videos),
    [videos],
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="aspect-video rounded-xl bg-slate-800" />
          <div className="h-32 rounded-xl bg-slate-800" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8">
        <p className="mx-auto max-w-7xl text-red-300">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-10">
        <header>
          <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl">Session Videos</h1>
          <p className="mt-1 text-slate-400">
            Cohort session recordings and learning content.
          </p>
        </header>

        {featured && (
          <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Link
              href={`/secured/videos/${featured.id}`}
              className="group relative block aspect-video overflow-hidden rounded-xl bg-slate-800"
            >
              <Image
                src={getYoutubeThumbnailUrl(featured.youtubeVideoId)}
                alt={featured.title}
                fill
                className="object-cover transition group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition group-hover:bg-black/40">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 text-white">
                  <Play className="h-8 w-8 fill-white" />
                </span>
              </div>
            </Link>
            <div className="flex flex-col justify-center">
              <span className="mb-2 inline-flex w-fit rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
                Featured
              </span>
              <Link href={`/secured/videos/${featured.id}`}>
                <h2 className="text-xl font-semibold text-slate-50 group-hover:text-white sm:text-2xl">
                  {featured.title}
                </h2>
              </Link>
              <p className="mt-2 text-sm text-slate-400">
                {getSessionVideoCategoryLabel(featured.category)} ·{' '}
                {formatViewCount(featured.viewCount)}
              </p>
            </div>
          </section>
        )}

        {videos.length === 0 ? (
          <p className="text-center text-slate-400">No videos available yet.</p>
        ) : (
          <>
            <VideoRow title="Most viewed" videos={mostViewed} />
            <VideoRow title="Recent" videos={recent} />
            {byCategory.map((group) => (
              <VideoRow
                key={group.value}
                title={group.label}
                videos={group.videos}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
