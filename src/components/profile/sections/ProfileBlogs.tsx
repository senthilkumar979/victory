'use client'

import { motion } from 'framer-motion'
import { BookOpen, ExternalLink } from 'lucide-react'

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
            key={blog.title}
            href={blog.link}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ x: 4, transition: { duration: 0.15 } }}
            className="group flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-primary/20 hover:bg-primary/5"
          >
            <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
              {blog.cover_image_url && (
                <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md bg-slate-100 border border-slate-100 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900">{blog.title}</h3>
              <p className="text-slate-500 text-sm">
                {formatDate(blog.published_date)}
              </p>
            </div>
            <ExternalLink className="size-4 shrink-0 text-slate-400 opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
          </motion.a>
        ))}
      </div>
    </div>
  )
}
