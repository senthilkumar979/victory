'use client'

import type { Blog } from '@/types/blog.types'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface FeaturedCarouselProps {
  blogs: Blog[]
}

export function FeaturedCarousel({ blogs }: FeaturedCarouselProps) {
  const [index, setIndex] = useState(0)
  const length = blogs.length

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % length)
  }, [length])

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + length) % length)
  }, [length])

  useEffect(() => {
    if (length <= 1) return
    const id = setInterval(goNext, 6000)
    return () => clearInterval(id)
  }, [length, goNext])

  if (length === 0) return null

  const blog = blogs[index]

  return (
    <div className="relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-xl">
      <AnimatePresence mode="wait" initial={false}>
        <motion.a
          key={blog.id ?? index}
          href={blog.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault()
            window.open(blog.link, '_blank', 'noopener,noreferrer')
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="relative flex h-full min-h-[360px] flex-col"
          aria-label={`Read: ${blog.title ?? 'Untitled'}`}
        >
          <div className="absolute inset-0">
            {blog.cover_image_url &&
            blog.cover_image_url.startsWith(
              'https://cdn-images-1.medium.com',
            ) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blog.cover_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex-shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-100 flex items-center justify-center object-contain" >
                <svg
                  className="w-full h-full"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 36 36"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          </div>
          <div className="relative mt-auto p-6 text-white">
            <h2 className="text-2xl font-bold leading-tight line-clamp-2 drop-shadow-sm sm:text-3xl">
              {blog.title || 'Untitled'}
            </h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/90">
              {blog.author_name && <span>{blog.author_name}</span>}
              {blog.published_date && (
                <>
                  <span className="text-white/50">·</span>
                  <time dateTime={blog.published_date}>
                    {formatDate(blog.published_date)}
                  </time>
                </>
              )}
            </div>
          </div>
        </motion.a>
      </AnimatePresence>

      {length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition hover:bg-black/70"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {blogs.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition ${
                  i === index
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
