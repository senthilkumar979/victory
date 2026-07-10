'use client'

import Image from 'next/image'
import Link from 'next/link'

import { getSessionVideoCategoryLabel } from '@/lib/sessionVideos/sessionVideoCategories'
import {
  formatViewCount,
  getYoutubeThumbnailUrl,
} from '@/lib/sessionVideos/youtubeUtils'
import type { SessionVideo } from '@/types/sessionVideo.types'
import { joinClassNames } from '@/utils/tailwindUtils'

interface VideoCardProps {
  video: SessionVideo
  className?: string
  layout?: 'vertical' | 'horizontal'
}

export const VideoCard = ({
  video,
  className,
  layout = 'vertical',
}: VideoCardProps) => {
  const href = `/secured/videos/${video.id}`
  const isHorizontal = layout === 'horizontal'

  return (
    <Link
      href={href}
      className={joinClassNames(
        'group flex gap-3 rounded-lg transition hover:bg-slate-900/60',
        isHorizontal ? 'flex-row p-2' : 'flex-col',
        className,
      )}
    >
      <div
        className={joinClassNames(
          'relative shrink-0 overflow-hidden rounded-lg bg-slate-800',
          isHorizontal ? 'h-24 w-40' : 'aspect-video w-full',
        )}
      >
        <Image
          src={getYoutubeThumbnailUrl(video.youtubeVideoId)}
          alt={video.title}
          fill
          sizes={isHorizontal ? '160px' : '(max-width: 768px) 100vw, 320px'}
          className="object-cover transition group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3
          className={joinClassNames(
            'font-medium text-slate-100 group-hover:text-white',
            isHorizontal ? 'line-clamp-2 text-sm' : 'line-clamp-2 text-sm sm:text-base',
          )}
        >
          {video.title}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          {getSessionVideoCategoryLabel(video.category)}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {formatViewCount(video.viewCount)}
        </p>
      </div>
    </Link>
  )
}
