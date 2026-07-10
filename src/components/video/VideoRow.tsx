'use client'

import type { SessionVideo } from '@/types/sessionVideo.types'
import { VideoCard } from './VideoCard'

interface VideoRowProps {
  title: string
  videos: SessionVideo[]
  layout?: 'vertical' | 'horizontal'
}

export const VideoRow = ({ title, videos, layout = 'vertical' }: VideoRowProps) => {
  if (videos.length === 0) return null

  const isHorizontal = layout === 'horizontal'

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
      <div
        className={
          isHorizontal
            ? 'flex flex-col gap-1'
            : 'flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
        }
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className={isHorizontal ? '' : 'w-64 shrink-0 sm:w-72'}
          >
            <VideoCard video={video} layout={layout} />
          </div>
        ))}
      </div>
    </section>
  )
}
