'use client'

import type { Blog } from '@/types/blog.types'
import { motion } from 'framer-motion'
import { BlogCard } from './BlogCard'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const card = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

interface BlogGridProps {
  blogs: Blog[]
}

export function BlogGrid({ blogs }: BlogGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {blogs.map((blog, index) => (
        <motion.div key={blog.id ?? index} variants={card}>
          <BlogCard
            id={blog.id}
            title={blog.title}
            author_name={blog.author_name}
            published_date={blog.published_date}
            cover_image_url={blog.cover_image_url}
            link={blog.link}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
