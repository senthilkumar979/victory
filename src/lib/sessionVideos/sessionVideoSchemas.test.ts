import { describe, expect, it } from 'vitest'

import { sessionVideoFormSchema } from './sessionVideoSchemas'

const validForm = {
  title: 'StoryLab Kickoff',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  category: 'story_lab',
  isFeatured: false,
}

describe('sessionVideoFormSchema', () => {
  it('accepts a trimmed valid session video payload', () => {
    const parsed = sessionVideoFormSchema.safeParse({
      ...validForm,
      title: '  StoryLab Kickoff  ',
      youtubeUrl: '  https://youtu.be/dQw4w9WgXcQ  ',
    })

    expect(parsed.success).toBe(true)
    if (!parsed.success) return
    expect(parsed.data).toEqual({
      title: 'StoryLab Kickoff',
      youtubeUrl: 'https://youtu.be/dQw4w9WgXcQ',
      category: 'story_lab',
      isFeatured: false,
    })
  })

  it('requires a title and a valid YouTube URL', () => {
    const emptyTitle = sessionVideoFormSchema.safeParse({
      ...validForm,
      title: '   ',
    })
    expect(emptyTitle.success).toBe(false)
    if (!emptyTitle.success) {
      expect(emptyTitle.error.issues[0]?.message).toBe('Title is required')
    }

    const badUrl = sessionVideoFormSchema.safeParse({
      ...validForm,
      youtubeUrl: 'https://vimeo.com/123456',
    })
    expect(badUrl.success).toBe(false)
    if (!badUrl.success) {
      expect(badUrl.error.issues[0]?.message).toBe(
        'Enter a valid YouTube video URL',
      )
    }
  })

  it('rejects unknown categories while requiring featured flag type', () => {
    const badCategory = sessionVideoFormSchema.safeParse({
      ...validForm,
      category: 'workshop',
    })
    expect(badCategory.success).toBe(false)
    if (!badCategory.success) {
      expect(badCategory.error.issues[0]?.message).toBe('Select a category')
    }

    const badFeatured = sessionVideoFormSchema.safeParse({
      ...validForm,
      isFeatured: 'yes',
    })
    expect(badFeatured.success).toBe(false)
  })
})
