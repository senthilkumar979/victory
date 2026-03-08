import { useCallback, useEffect, useState } from 'react'

import { getBlogsByStudent } from '@/lib/blogService'

import type { Blog } from '@/types/blog.types'

interface UseStudentBlogsReturn {
  blogs: Blog[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const useStudentBlogs = (
  mediumUsername?: string | null,
  authorName?: string | null,
): UseStudentBlogsReturn => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlogs = useCallback(async () => {
    if (!mediumUsername && !authorName) {
      setBlogs([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await getBlogsByStudent(mediumUsername, authorName)
      setBlogs(data)
    } catch (err) {
      console.error('Error fetching student blogs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs')
      setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [mediumUsername, authorName])

  useEffect(() => {
    void fetchBlogs()
  }, [fetchBlogs])

  return { blogs, loading, error, refetch: fetchBlogs }
}
