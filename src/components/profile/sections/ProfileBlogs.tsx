'use client'

import { motion } from 'framer-motion'
import { BookOpen, CalendarIcon, ExternalLink } from 'lucide-react'

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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            id="Medium-Logo-2--Streamline-Logos"
            height="24"
            width="24"
          >
            <desc>Medium Logo 2 Streamline Icon: https://streamlinehq.com</desc>
            <path
              fillRule="evenodd"
              d="M1 1h22v22H1V1Zm14.522 5.5H19L17.5 8v8l1.5 1.5h-5.5L15 16V9.723l-2.343 4.62L11 17.5l-3.5 -6.417V15.5l2 2h-5l2 -2V9.25L5 6.5h3l4.059 6.812 3.416 -6.738 0.025 -0.074h0.013l0.002 -0.004 0.007 0.004Z"
              clipRule="evenodd"
              strokeWidth="1"
              stroke="currentColor"
            ></path>
          </svg>
          Blogs
        </h2>
        {blogs?.[0]?.username && (
          <motion.a
            href={`https://medium.com/@${blogs?.[0]?.username}`}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            View Publications
            <ExternalLink className="size-3.5" />
          </motion.a>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {blogs.map((blog, idx) => (
          <motion.a
            key={blog.link + idx}
            href={blog.link}
            target="_blank"
            rel="noreferrer"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ x: 4, transition: { duration: 0.15 } }}
            className="group flex items-center gap-4 rounded-xl border border-slate-100 border-blue-500/30 bg-secondary bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent p-4 transition-all hover:border-primary/20 hover:bg-primary"
          >
            <div className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
              {blog.cover_image_url ? (
                <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md bg-slate-100 border border-slate-100 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={blog.cover_image_url}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md bg-slate-100 border border-slate-100 flex items-center justify-center">
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
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white">{blog.title}</h3>
              <p className="text-slate-500 text-sm group-hover:text-white flex items-center gap-2">
                <CalendarIcon className="size-4 text-slate-400" />{' '}
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
