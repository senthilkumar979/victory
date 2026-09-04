import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

import {
  requestAwardCoverGenerate,
  requestAwardLinkedInBootstrapDeduped,
  requestAwardPostGenerate,
  requestLinkedInPublish,
} from './awardLinkedInApi'

const award: AwardFormState = {
  id: 'award/1',
  awardedTo: 'ada@example.com',
  awardedOn: '2026-01-15',
  description: 'Outstanding contributor',
  awardCategoryId: 'cat-1',
  student: { name: 'Ada Lovelace', picture: '', batch: '1' },
}

function jsonResponse(ok: boolean, body: unknown, status = ok ? 200 : 400): Response {
  return { ok, status, json: async () => body } as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('awardLinkedInApi', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('encodes the award id when generating a cover image', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(true, { previewUrl: 'https://cdn.example/cover.png' }))

    const result = await requestAwardCoverGenerate('award/1', {
      userPrompt: 'logo lockup',
      replacePreviewPathname: 'previews/old.png',
    })

    expect(fetch).toHaveBeenCalledWith(
      '/api/awards/award%2F1/cover-image/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: 'logo lockup',
          replacePreviewPathname: 'previews/old.png',
        }),
      }),
    )
    expect(result).toEqual({
      ok: true,
      status: 200,
      data: { previewUrl: 'https://cdn.example/cover.png' },
    })
  })

  it('posts the award LinkedIn body when generating commentary', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(true, { commentary: 'Congrats Ada' }))

    const result = await requestAwardPostGenerate(award, 'Outstanding Contributor')

    expect(fetch).toHaveBeenCalledWith(
      '/api/linkedin/generate-post',
      expect.objectContaining({ method: 'POST' }),
    )
    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)) as {
      variant: string
      title: string
    }
    expect(body.variant).toBe('award')
    expect(body.title).toContain('Ada Lovelace')
    expect(result).toEqual({ ok: true, data: { commentary: 'Congrats Ada' } })
  })

  it('coalesces parallel bootstrap calls for the same award and category', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('cover-image')) {
        return jsonResponse(true, { previewUrl: 'https://cdn.example/cover.png' })
      }
      return jsonResponse(true, { commentary: 'Congrats' })
    })

    const first = requestAwardLinkedInBootstrapDeduped('a1', award, 'Cat')
    const second = requestAwardLinkedInBootstrapDeduped('a1', award, 'Cat')
    const other = requestAwardLinkedInBootstrapDeduped('a1', award, 'Other')

    expect(first).toBe(second)
    expect(first).not.toBe(other)

    const [shared, distinct] = await Promise.all([first, other])
    expect(shared.cover.ok).toBe(true)
    expect(distinct.post.ok).toBe(true)
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('truncates LinkedIn image alt text to 400 characters', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse(false, { error: 'Rejected' }))

    const result = await requestLinkedInPublish('Hello', 'https://cdn.example/a.png', 'x'.repeat(401))

    const body = JSON.parse(String(vi.mocked(fetch).mock.calls[0]?.[1]?.body)) as {
      imageAltText: string
      commentary: string
    }
    expect(fetch).toHaveBeenCalledWith(
      '/api/linkedin/publish',
      expect.objectContaining({ method: 'POST' }),
    )
    expect(body.commentary).toBe('Hello')
    expect(body.imageAltText).toHaveLength(400)
    expect(result).toEqual({ ok: false, data: { error: 'Rejected' } })
  })
})
