'use client'

import { motion } from 'framer-motion'
import { CalendarIcon } from 'lucide-react'

export interface BlogCardProps {
  id: string | null
  title: string | null
  author_name: string | null
  published_date: string | null
  cover_image_url: string | null
  link: string
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function BlogCard({
  title,
  author_name,
  published_date,
  cover_image_url,
  link,
}: BlogCardProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open(link, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ scale: 1.03 }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-blue-500/30 bg-secondary bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent p-4 pb-0 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl"
      style={{ borderRadius: 16 }}
    >
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex h-full flex-col"
        aria-label={`Read: ${title ?? 'Untitled'}`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 rounded-lg">
          {cover_image_url &&
          cover_image_url.startsWith(
            'https://cdn-images-1.medium.com',
          ) ? (
            <div className="h-full w-full overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover_image_url}
                alt=""
                className="w-full object-cover h-full transition-transform duration-300 ease-out group-hover:scale-[1.08] rounded-md"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <svg
                className="h-14 w-14"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-2 pt-4">
          <h2 className="text-lg font-semibold leading-snug text-white line-clamp-2 group-hover:text-primary">
            {title || 'Untitled'}
          </h2>
          <div className="mt-3 flex flex-wrap items-center gap-x-2 text-sm text-slate-500">
            {author_name && <span className="text-white">{author_name}</span>}
            {author_name && published_date && (
              <span aria-hidden className="text-white">
                ·
              </span>
            )}
            {published_date && (
              <>
                <CalendarIcon className="size-4 text-white" />
                <time dateTime={published_date} className="text-white">
                  {formatDate(published_date)}
                </time>
              </>
            )}
          </div>
        </div>
      </a>
    </motion.article>
  )
}
