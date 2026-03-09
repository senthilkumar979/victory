import { supabase } from '@/lib/supabaseClient'
import type { Blog } from '@/types/blog.types'

const PAGE_SIZE = 20

export interface GetBlogsParams {
  page: number
  authorName?: string | null
}

export interface GetBlogsResult {
  data: Blog[]
  totalCount: number
  totalPages: number
}

/**
 * Fetches paginated blogs from Supabase.
 * Page size: 20. Order: published_date descending.
 */
export async function getBlogs({
  page,
  authorName,
}: GetBlogsParams): Promise<GetBlogsResult> {
  const start = (page - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE - 1

  let query = supabase
    .from('blogs')
    .select('id, title, author_name, published_date, cover_image_url, link', {
      count: 'exact',
    })
    .order('published_date', { ascending: false })

  if (authorName) {
    query = query.eq('author_name', authorName)
  }

  const { data, error, count } = await query.range(start, end)

  if (error) throw error

  const totalCount = count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return {
    data: (data ?? []) as Blog[],
    totalCount,
    totalPages,
  }
}

const HERO_SIZE = 10
const REMAINING_PAGE_SIZE = 20

export interface GetBlogsHeroResult {
  data: Blog[]
  totalCount: number
}

/**
 * Fetches first 10 blogs for the news hero (featured carousel + next 5).
 */
export async function getBlogsHero(
  authorName?: string | null,
): Promise<GetBlogsHeroResult> {
  let query = supabase
    .from('blogs')
    .select('id, title, author_name, published_date, cover_image_url, link', {
      count: 'exact',
    })
    .order('published_date', { ascending: false })

  if (authorName) {
    query = query.eq('author_name', authorName)
  }

  const { data, error, count } = await query.range(0, HERO_SIZE - 1)

  if (error) throw error

  return {
    data: (data ?? []) as Blog[],
    totalCount: count ?? 0,
  }
}

export interface GetBlogsRemainingParams {
  page: number
  authorName?: string | null
}

export interface GetBlogsRemainingResult {
  data: Blog[]
  totalCount: number
  totalRemaining: number
  totalRemainingPages: number
}

/**
 * Fetches remaining blogs (from 11 onwards), paginated by 20.
 */
export async function getBlogsRemaining({
  page,
  authorName,
}: GetBlogsRemainingParams): Promise<GetBlogsRemainingResult> {
  const start = HERO_SIZE + (page - 1) * REMAINING_PAGE_SIZE
  const end = start + REMAINING_PAGE_SIZE - 1

  let query = supabase
    .from('blogs')
    .select('id, title, author_name, published_date, cover_image_url, link', {
      count: 'exact',
    })
    .order('published_date', { ascending: false })

  if (authorName) {
    query = query.eq('author_name', authorName)
  }

  const { data, error, count } = await query.range(start, end)

  if (error) throw error

  const totalCount = count ?? 0
  const totalRemaining = Math.max(0, totalCount - HERO_SIZE)
  const totalRemainingPages = Math.max(
    1,
    Math.ceil(totalRemaining / REMAINING_PAGE_SIZE),
  )

  return {
    data: (data ?? []) as Blog[],
    totalCount,
    totalRemaining,
    totalRemainingPages,
  }
}

const BLOG_SELECT = 'id, title, author_name, published_date, cover_image_url, link, username'

/**
 * Fetches blogs for a student. Uses author_name (student name) or username
 * column if it exists. Blogs synced from Medium store author_name.
 */
export async function getBlogsByStudent(
  mediumUsername?: string | null,
  authorName?: string | null,
): Promise<Blog[]> {
  if (!mediumUsername && !authorName) return []

  if (authorName) {
    const { data, error } = await supabase
      .from('blogs')
      .select(BLOG_SELECT)
      .eq('author_name', authorName)
      .order('published_date', { ascending: false })
      .limit(20)
    if (!error && data?.length) return data as Blog[]
  }

  if (mediumUsername) {
    const { data, error } = await supabase
      .from('blogs')
      .select(BLOG_SELECT)
      .eq('username', mediumUsername)
      .order('published_date', { ascending: false })
      .limit(20)
    if (!error && data?.length) return data as Blog[]
  }
  return []
}

/**
 * Fetches distinct author names from the blogs table.
 */
export async function getAuthors(): Promise<string[]> {
  const { data } = await supabase
    .from('blogs')
    .select('author_name')
    .limit(500)

  const names = (data ?? [])
    .map((r) => r.author_name)
    .filter((n): n is string => Boolean(n))

  return [...new Set(names)].sort()
}
