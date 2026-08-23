import { beforeEach, describe, expect, it, vi } from 'vitest'

const { dbState } = vi.hoisted(() => ({
  dbState: { client: null as unknown },
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return dbState.client
  },
}))

import { insertVisitorChatQuery } from './visitorChatQueryLog'

describe('insertVisitorChatQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbState.client = null
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns without throwing when supabaseAdmin is unconfigured', async () => {
    await expect(
      insertVisitorChatQuery({ query: 'Who mentors students?', threadMessageCount: 2 }),
    ).resolves.toBeUndefined()
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('supabaseAdmin unavailable'),
    )
  })

  it('swallows insert errors so chat replies still succeed', async () => {
    const insert = vi.fn().mockResolvedValue({
      error: { message: 'insert denied', code: '42501' },
    })
    dbState.client = { from: vi.fn().mockReturnValue({ insert }) }

    await expect(
      insertVisitorChatQuery({ query: 'Tell me about batches', threadMessageCount: 4 }),
    ).resolves.toBeUndefined()

    expect(insert).toHaveBeenCalledWith({
      query_text: 'Tell me about batches',
      thread_message_count: 4,
    })
    expect(console.error).toHaveBeenCalled()
  })

  it('inserts the query row when the database is available', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null })
    const from = vi.fn().mockReturnValue({ insert })
    dbState.client = { from }

    await insertVisitorChatQuery({ query: 'hi', threadMessageCount: 1 })

    expect(from).toHaveBeenCalledWith('visitor_chat_queries')
    expect(insert).toHaveBeenCalledWith({
      query_text: 'hi',
      thread_message_count: 1,
    })
    expect(console.error).not.toHaveBeenCalled()
  })
})
