import { useCallback, useEffect, useState } from 'react'

import {
  getAuthors,
  getBlogsHero,
  getBlogsRemaining,
} from '@/lib/blogService'
import type { Blog } from '@/types/blog.types'

export interface UseBlogsReturn {
  featured: Blog[]
  next5: Blog[]
  remaining: Blog[]
  authors: string[]
  heroLoading: boolean
  remainingLoading: boolean
  error: string | null
  totalCount: number
  remainingPage: number
  totalRemainingPages: number
  setRemainingPage: (page: number) => void
  authorFilter: string | null
  setAuthorFilter: (author: string | null) => void
  refetch: () => Promise<void>
}

export function useBlogs(): UseBlogsReturn {
  const [featured, setFeatured] = useState<Blog[]>([])
  const [next5, setNext5] = useState<Blog[]>([])
  const [remaining, setRemaining] = useState<Blog[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [heroLoading, setHeroLoading] = useState(true)
  const [remainingLoading, setRemainingLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [remainingPage, setRemainingPage] = useState(1)
  const [totalRemainingPages, setTotalRemainingPages] = useState(1)
  const [authorFilter, setAuthorFilter] = useState<string | null>(null)

  const fetchAuthors = useCallback(async () => {
    const list = await getAuthors()
    setAuthors(list)
  }, [])

  const fetchHero = useCallback(async () => {
    try {
      setHeroLoading(true)
      setError(null)
      const result = await getBlogsHero(authorFilter || undefined)
      const all = result.data
      setFeatured(all.slice(0, 5))
      setNext5(all.slice(5, 10))
      setTotalCount(result.totalCount)
    } catch (err) {
      console.error('Error fetching hero blogs:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to fetch blogs',
      )
    } finally {
      setHeroLoading(false)
    }
  }, [authorFilter])

  const fetchRemaining = useCallback(
    async (page: number) => {
      if (totalCount <= 10) {
        setRemaining([])
        setTotalRemainingPages(1)
        return
      }
      try {
        setRemainingLoading(true)
        const result = await getBlogsRemaining({
          page,
          authorName: authorFilter || undefined,
        })
        setRemaining(result.data)
        setTotalRemainingPages(result.totalRemainingPages)
      } catch (err) {
        console.error('Error fetching remaining blogs:', err)
      } finally {
        setRemainingLoading(false)
      }
    },
    [authorFilter, totalCount],
  )

  const refetch = useCallback(async () => {
    await fetchAuthors()
    await fetchHero()
  }, [fetchAuthors, fetchHero])

  useEffect(() => {
    void fetchAuthors()
  }, [fetchAuthors])

  useEffect(() => {
    void fetchHero()
  }, [fetchHero])

  useEffect(() => {
    setRemainingPage(1)
  }, [authorFilter])

  useEffect(() => {
    if (totalCount > 10) {
      void fetchRemaining(remainingPage)
    } else {
      setRemaining([])
      setTotalRemainingPages(1)
    }
  }, [totalCount, remainingPage, fetchRemaining])

  return {
    featured,
    next5,
    remaining,
    authors,
    heroLoading,
    remainingLoading,
    error,
    totalCount,
    remainingPage,
    totalRemainingPages,
    setRemainingPage,
    authorFilter,
    setAuthorFilter,
    refetch,
  }
}
