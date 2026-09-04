import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

import { useAwardLinkedInPublish } from './useAwardLinkedInPublish'

const { draftState, publishMock, errorToastMock } = vi.hoisted(() => ({
  draftState: {
    commentary: 'Congrats Ada',
    coverUrl: 'https://cdn.example/cover.png',
    isBootstrapping: false,
    isGeneratingCover: false,
    isGeneratingPost: false,
  },
  publishMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('./useAwardLinkedInDraft', () => ({
  useAwardLinkedInDraft: () => draftState,
}))

vi.mock('./awardLinkedInApi', () => ({
  requestLinkedInPublish: (...args: unknown[]) => publishMock(...args),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    error: errorToastMock,
    success: vi.fn(),
  },
}))

const award: AwardFormState = {
  awardedTo: 'ada@example.com',
  awardedOn: '2026-01-15',
  description: 'Great work',
  awardCategoryId: 'cat-1',
}

afterEach(() => {
  cleanup()
})

describe('useAwardLinkedInPublish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    draftState.commentary = 'Congrats Ada'
    draftState.coverUrl = 'https://cdn.example/cover.png'
    draftState.isBootstrapping = false
    draftState.isGeneratingCover = false
    draftState.isGeneratingPost = false
    publishMock.mockResolvedValue({ ok: true, data: {} })
  })

  it('blocks publish when commentary or cover image is blank', async () => {
    const { result, rerender } = renderHook(() =>
      useAwardLinkedInPublish({ award, categoryName: 'Cat', isOpen: true }),
    )

    draftState.commentary = '   '
    rerender()
    await expect(result.current.publish({ imageAltText: 'Ada' })).resolves.toBe(false)
    expect(errorToastMock).toHaveBeenCalledWith(
      'Post text is empty.',
      expect.any(Object),
    )
    expect(publishMock).not.toHaveBeenCalled()

    draftState.commentary = 'Congrats Ada'
    draftState.coverUrl = '   '
    rerender()
    await expect(result.current.publish({ imageAltText: 'Ada' })).resolves.toBe(false)
    expect(errorToastMock).toHaveBeenCalledWith(
      'Cover image is missing.',
      expect.any(Object),
    )
    expect(publishMock).not.toHaveBeenCalled()
  })

  it('publishes trimmed text and image, then reports API and network failures', async () => {
    const onSuccess = vi.fn()
    const { result, rerender } = renderHook(() =>
      useAwardLinkedInPublish({ award, categoryName: 'Cat', isOpen: true }),
    )

    let published = false
    await act(async () => {
      published = await result.current.publish({
        imageAltText: 'Ada award',
        onSuccess,
      })
    })
    expect(published).toBe(true)
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(publishMock).toHaveBeenCalledWith(
      'Congrats Ada',
      'https://cdn.example/cover.png',
      'Ada award',
    )
    expect(result.current.isPublishing).toBe(false)
    expect(result.current.isBusy).toBe(false)

    publishMock.mockResolvedValue({ ok: false, data: {} })
    await expect(
      result.current.publish({ imageAltText: 'Ada award' }),
    ).resolves.toBe(false)
    expect(errorToastMock).toHaveBeenCalledWith(
      'Failed to publish to LinkedIn',
      expect.any(Object),
    )

    publishMock.mockRejectedValue(new Error('offline'))
    draftState.isGeneratingCover = true
    rerender()
    expect(result.current.isBusy).toBe(true)
    await expect(
      result.current.publish({ imageAltText: 'Ada award' }),
    ).resolves.toBe(false)
  })
})
