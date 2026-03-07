'use client'

import type { Blog } from '@/types/blog.types'
import { motion } from 'framer-motion'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface Next5ListProps {
  blogs: Blog[]
}

export function Next5List({ blogs }: Next5ListProps) {
  if (blogs.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {blogs.map((blog, i) => (
        <motion.a
          key={blog.id ?? i}
          href={blog.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault()
            window.open(blog.link, '_blank', 'noopener,noreferrer')
          }}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3 }}
          className="group flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          aria-label={`Read: ${blog.title ?? 'Untitled'}`}
        >
          <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {blog.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={blog.cover_image_url}
                alt=""
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-slate-200" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-primary">
              {blog.title || 'Untitled'}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
              {blog.author_name && <span>{blog.author_name}</span>}
              {blog.published_date && (
                <>
                  <span>·</span>
                  <time dateTime={blog.published_date}>
                    {formatDate(blog.published_date)}
                  </time>
                </>
              )}
            </div>
          </div>
        </motion.a>
      ))}
    </div>
  )
}
