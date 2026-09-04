import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

import { useAwardLinkedInDraft } from './useAwardLinkedInDraft'

const {
  bootstrapMock,
  coverMock,
  postMock,
} = vi.hoisted(() => ({
  bootstrapMock: vi.fn(),
  coverMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('./awardLinkedInApi', () => ({
  requestAwardLinkedInBootstrapDeduped: (...args: unknown[]) =>
    bootstrapMock(...args),
  requestAwardCoverGenerate: (...args: unknown[]) => coverMock(...args),
  requestAwardPostGenerate: (...args: unknown[]) => postMock(...args),
}))

const award: AwardFormState = {
  id: 'award-1',
  awardedTo: 'ada@example.com',
  awardedOn: '2026-01-15',
  description: 'Great work',
  awardCategoryId: 'cat-1',
  student: { name: 'Ada', picture: '', batch: '1' },
}

afterEach(() => {
  cleanup()
})

describe('useAwardLinkedInDraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    bootstrapMock.mockResolvedValue({
      cover: {
        ok: true,
        data: {
          promptUsed: 'cover prompt',
          previewUrl: 'https://cdn.example/cover.png',
          previewPathname: 'previews/cover.png',
        },
      },
      post: { ok: true, data: { commentary: 'Congrats Ada' } },
    })
  })

  it('skips bootstrap when the drawer is closed or the award has no id', async () => {
    const { rerender } = renderHook(
      ({ isOpen, current }) =>
        useAwardLinkedInDraft({ award: current, categoryName: 'Cat', isOpen }),
      { initialProps: { isOpen: false, current: award } },
    )

    expect(bootstrapMock).not.toHaveBeenCalled()

    rerender({ isOpen: true, current: { ...award, id: undefined } })
    await act(async () => {})
    expect(bootstrapMock).not.toHaveBeenCalled()
  })

  it('loads cover and commentary, then ignores a stale bootstrap after close', async () => {
    let resolveBootstrap: (value: unknown) => void = () => {}
    bootstrapMock.mockReturnValue(
      new Promise((resolve) => {
        resolveBootstrap = resolve
      }),
    )

    const { result, rerender } = renderHook(
      ({ isOpen }) =>
        useAwardLinkedInDraft({ award, categoryName: 'Cat', isOpen }),
      { initialProps: { isOpen: true } },
    )

    await waitFor(() => expect(result.current.isBootstrapping).toBe(true))

    rerender({ isOpen: false })

    await act(async () => {
      resolveBootstrap({
        cover: { ok: true, data: { previewUrl: 'https://stale.example/cover.png' } },
        post: { ok: true, data: { commentary: 'stale' } },
      })
    })

    expect(result.current.coverUrl).toBeNull()
    expect(result.current.commentary).toBe('')
    expect(result.current.generateError).toBeNull()
    expect(result.current.isBootstrapping).toBe(false)
  })

  it('maps cover and post bootstrap failures, and regenerates with trimmed prompts', async () => {
    bootstrapMock.mockResolvedValue({
      cover: { ok: false, data: {} },
      post: { ok: true, data: { commentary: 'unused' } },
    })

    const { result, rerender } = renderHook(
      ({ categoryName }) =>
        useAwardLinkedInDraft({ award, categoryName, isOpen: true }),
      { initialProps: { categoryName: 'Cat' } },
    )

    await waitFor(() =>
      expect(result.current.generateError).toBe('Failed to generate cover image'),
    )

    bootstrapMock.mockResolvedValue({
      cover: { ok: true, data: { previewUrl: 'https://cdn.example/ok.png' } },
      post: { ok: false, data: { error: 'Gemini down' } },
    })
    rerender({ categoryName: 'Other' })
    await waitFor(() => expect(result.current.generateError).toBe('Gemini down'))

    coverMock.mockResolvedValue({
      ok: true,
      data: {
        promptUsed: 'new prompt',
        previewUrl: 'https://cdn.example/new.png',
        previewPathname: 'previews/new.png',
      },
    })
    act(() => result.current.setCoverPrompt('   '))
    await act(async () => {
      await result.current.regenerateCover()
    })
    expect(coverMock).toHaveBeenCalledWith('award-1', {
      userPrompt: undefined,
      replacePreviewPathname: undefined,
    })
    expect(result.current.coverUrl).toBe('https://cdn.example/new.png')

    postMock.mockResolvedValue({ ok: false, data: {} })
    await act(async () => {
      await result.current.regeneratePost()
    })
    expect(postMock).toHaveBeenCalledWith(award, 'Other')
    expect(result.current.generateError).toBe('Failed to regenerate post')
  })
})
