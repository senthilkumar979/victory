'use client'

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
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
      >
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Blogs</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </motion.section>
    )
  }

  if (blogs.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
    >
      <h2 className="mb-6 text-xl font-semibold text-slate-900">Blogs</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog, idx) => (
          <motion.a
            key={blog.id ?? blog.link}
            href={blog.link}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.06 }}
            whileHover={{ y: -4 }}
            className="group block overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 transition-all hover:border-primary/30 hover:shadow-md"
          >
            {blog.cover_image_url && (
              <div className="aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="line-clamp-2 font-medium text-slate-900 group-hover:text-primary">
                {blog.title || 'Untitled'}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(blog.published_date)}
              </p>
            </div>
          </motion.a>
        ))}
      </div>
    </motion.section>
  )
}
