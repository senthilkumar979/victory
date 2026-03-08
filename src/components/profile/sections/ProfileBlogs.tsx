'use client'

import { BookOpen, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Blog } from '@/types/blog.types'

interface ProfileBlogsProps {
  blogs: Blog[]
  loading: boolean
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const ProfileBlogs = ({ blogs, loading }: ProfileBlogsProps) => {
  if (loading) {
    return (
      <div>
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Blogs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-36 animate-pulse rounded-xl bg-slate-100/80"
            />
          ))}
        </div>
      </div>
    )
  }

  if (blogs.length === 0) {
    return (
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          <BookOpen className="size-4" />
          Blogs
        </h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="size-12 text-slate-200" />
          <p className="mt-2 text-sm text-slate-500">No blogs published yet</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
        <BookOpen className="size-4" />
        Blogs
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {blogs.map((blog, idx) => (
          <motion.a
            key={blog.id ?? blog.link}
            href={blog.link}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="group relative block overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:border-primary/30 hover:shadow-lg"
          >
            {blog.cover_image_url && (
              <div className="aspect-[16/9] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            )}
            <div className="p-4">
              <h3 className="line-clamp-2 font-semibold text-slate-900 transition-colors group-hover:text-primary">
                {blog.title || 'Untitled'}
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {formatDate(blog.published_date)}
                </p>
                <ExternalLink className="size-4 text-slate-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100 group-hover:text-primary" />
              </div>
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  )
}
