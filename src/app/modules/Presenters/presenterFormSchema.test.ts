import { describe, expect, it } from 'vitest'

import { presenterFormSchema } from './presenterFormSchema'

const validPresenter = {
  presentedBy: 'ada@example.com',
  presentedDate: '2026-06-01T12:00:00.000Z',
  topic: 'React Server Components',
}

describe('presenterFormSchema', () => {
  it('accepts trimmed presenter, date, and topic', () => {
    const result = presenterFormSchema.safeParse({
      presentedBy: '  ada@example.com  ',
      presentedDate: '  2026-06-01T12:00:00.000Z  ',
      topic: '  React Server Components  ',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.presentedBy).toBe('ada@example.com')
      expect(result.data.presentedDate).toBe('2026-06-01T12:00:00.000Z')
      expect(result.data.topic).toBe('React Server Components')
    }
  })

  it('rejects whitespace-only required fields', () => {
    expect(
      presenterFormSchema.safeParse({ ...validPresenter, presentedBy: '   ' })
        .success,
    ).toBe(false)
    expect(
      presenterFormSchema.safeParse({ ...validPresenter, topic: '   ' }).success,
    ).toBe(false)
    expect(
      presenterFormSchema.safeParse({ ...validPresenter, presentedDate: '' })
        .success,
    ).toBe(false)
  })

  it('rejects an unparseable presentation date', () => {
    const result = presenterFormSchema.safeParse({
      ...validPresenter,
      presentedDate: 'soon',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Invalid date')
    }
  })
})
