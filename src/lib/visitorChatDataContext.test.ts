import { beforeEach, describe, expect, it, vi } from 'vitest'

const { dbState } = vi.hoisted(() => ({
  dbState: { client: null as unknown },
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: { from: () => { throw new Error('public client should not be used when admin exists') } },
}))

import { getCachedVisitorChatDataContext } from './visitorChatDataContext'

function studentChain(result: { data: unknown[] | null; error: { message: string } | null }) {
  const secondOrder = vi.fn().mockResolvedValue(result)
  const firstOrder = vi.fn().mockReturnValue({ order: secondOrder })
  const select = vi.fn().mockReturnValue({ order: firstOrder })
  return { select, firstOrder, secondOrder }
}

function blogChain(result: { data: unknown[] | null; error: { message: string } | null }) {
  const limit = vi.fn().mockResolvedValue(result)
  const order = vi.fn().mockReturnValue({ limit })
  const select = vi.fn().mockReturnValue({ order })
  return { select, order, limit }
}

function mockDb(options: {
  students: { data: unknown[] | null; error: { message: string } | null }
  blogs: { data: unknown[] | null; error: { message: string } | null }
}) {
  const students = studentChain(options.students)
  const blogs = blogChain(options.blogs)
  const from = vi.fn((table: string) => (table === 'students' ? students : blogs))
  dbState.client = { from }
  return { from, students, blogs }
}

describe('getCachedVisitorChatDataContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns an empty snapshot when the students query fails', async () => {
    const { blogs } = mockDb({
      students: { data: null, error: { message: 'students down' } },
      blogs: { data: [{ title: 'Should not appear', link: '/x', published_date: '2026-01-01' }], error: null },
    })

    await expect(getCachedVisitorChatDataContext()).resolves.toBe('')
    expect(blogs.select).not.toHaveBeenCalled()
  })

  it('parses skill JSON, isolates blog errors, and keeps student lines', async () => {
    mockDb({
      students: {
        data: [
          {
            id: 's1',
            name: 'Ada',
            role: 'Engineer',
            company: 'Acme',
            batch: 4,
            summary: '  Built  compilers   ',
            skill_sets: '["React", " Node "]',
          },
          {
            id: 's2',
            name: null,
            role: null,
            company: null,
            batch: null,
            summary: null,
            skill_sets: '{not-json',
          },
        ],
        error: null,
      },
      blogs: { data: null, error: { message: 'blogs down' } },
    })

    const text = await getCachedVisitorChatDataContext()

    expect(text).toContain('Ada | Engineer | Acme | Batch 4 | Skills: React, Node | Summary: Built compilers | Profile: https://www.mentorbridge.in/students/s1')
    expect(text).toContain('(unnamed) | — | — | Batch — | Skills: — | Profile: https://www.mentorbridge.in/students/s2')
    expect(text).not.toContain('Blog posts')
    expect(console.error).toHaveBeenCalledWith(
      '[visitor-chat] blogs fetch:',
      'blogs down',
    )
  })

  it('includes blog links and truncates oversized snapshots', async () => {
    mockDb({
      students: {
        data: [
          {
            id: 'huge',
            name: 'X'.repeat(400_000),
            role: 'Dev',
            company: 'Co',
            batch: 1,
            summary: 'ok',
            skill_sets: [],
          },
        ],
        error: null,
      },
      blogs: {
        data: [{ title: null, link: '  ', published_date: '2026-01-01' }],
        error: null,
      },
    })

    const text = await getCachedVisitorChatDataContext()

    expect(text.length).toBeLessThan(400_000)
    expect(text).toContain(
      '[Snapshot truncated at 380000 characters; suggest /students or /blogs for browsing.]',
    )
    expect(text).not.toContain('Untitled — https://www.mentorbridge.in/blogs')
  })
})
