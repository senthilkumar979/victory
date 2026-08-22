import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { publishImagePostToLinkedIn } from './publishToLinkedIn'

function jsonResponse(
  body: unknown,
  init: { status?: number; headers?: Record<string, string> } = {},
) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
}

function imageResponse(mimeType: string) {
  return new Response(new ArrayBuffer(8), {
    status: 200,
    headers: { 'Content-Type': mimeType },
  })
}

describe('publishImagePostToLinkedIn', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('LINKEDIN_ACCESS_TOKEN', 'li-token')
    vi.stubEnv('LINKEDIN_ORGANIZATION_ID', '12345')
    delete process.env.LINKEDIN_ORGANIZATION_URN
    delete process.env.LINKEDIN_REST_VERSION
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('throws when the access token or organization is missing', async () => {
    vi.stubEnv('LINKEDIN_ACCESS_TOKEN', '')

    await expect(
      publishImagePostToLinkedIn({
        commentary: 'Hello',
        imageUrl: 'https://cdn.example.com/cover.jpg',
      }),
    ).rejects.toThrow('LINKEDIN_ACCESS_TOKEN is not set')

    vi.stubEnv('LINKEDIN_ACCESS_TOKEN', 'li-token')
    vi.stubEnv('LINKEDIN_ORGANIZATION_ID', '')

    await expect(
      publishImagePostToLinkedIn({
        commentary: 'Hello',
        imageUrl: 'https://cdn.example.com/cover.jpg',
      }),
    ).rejects.toThrow('LINKEDIN_ORGANIZATION_URN or LINKEDIN_ORGANIZATION_ID')
  })

  it('rejects unsupported image MIME types before talking to LinkedIn', async () => {
    fetchMock.mockResolvedValueOnce(imageResponse('image/webp'))

    await expect(
      publishImagePostToLinkedIn({
        commentary: 'Hello',
        imageUrl: 'https://cdn.example.com/cover.webp',
      }),
    ).rejects.toThrow('Unsupported image type: image/webp')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws when initializeUpload returns incomplete data', async () => {
    fetchMock
      .mockResolvedValueOnce(imageResponse('image/png'))
      .mockResolvedValueOnce(jsonResponse({ value: { uploadUrl: 'https://up.example' } }))

    await expect(
      publishImagePostToLinkedIn({
        commentary: 'Hello',
        imageUrl: 'https://cdn.example.com/cover.png',
      }),
    ).rejects.toThrow('LinkedIn initializeUpload returned incomplete data')
  })

  it('fails immediately when image processing reports PROCESSING_FAILED', async () => {
    fetchMock
      .mockResolvedValueOnce(imageResponse('image/jpeg; charset=binary'))
      .mockResolvedValueOnce(
        jsonResponse({
          value: {
            uploadUrl: 'https://up.example/put',
            image: 'urn:li:image:1',
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(jsonResponse({ status: 'PROCESSING_FAILED' }))

    await expect(
      publishImagePostToLinkedIn({
        commentary: 'Hello',
        imageUrl: 'https://cdn.example.com/cover.jpg',
      }),
    ).rejects.toThrow('LinkedIn image processing failed')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('publishes when the first image poll is AVAILABLE and truncates commentary', async () => {
    const longCommentary = `${'a'.repeat(2901)} extra`
    fetchMock
      .mockResolvedValueOnce(imageResponse('image/png'))
      .mockResolvedValueOnce(
        jsonResponse({
          value: {
            uploadUrl: 'https://up.example/put',
            image: 'urn:li:image:9',
          },
        }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(jsonResponse({ status: 'AVAILABLE' }))
      .mockResolvedValueOnce(
        jsonResponse(
          {},
          { status: 201, headers: { 'x-restli-id': 'urn:li:share:99' } },
        ),
      )

    await expect(
      publishImagePostToLinkedIn({
        commentary: longCommentary,
        imageUrl: 'https://cdn.example.com/cover.png',
        imageAltText: 'Award cover',
      }),
    ).resolves.toEqual({ postUrn: 'urn:li:share:99' })

    const postCall = fetchMock.mock.calls.find(
      ([url]) => url === 'https://api.linkedin.com/rest/posts',
    )
    expect(postCall).toBeTruthy()
    const body = JSON.parse((postCall?.[1] as { body: string }).body) as {
      author: string
      commentary: string
      content: { media: { id: string; altText?: string } }
    }
    expect(body.author).toBe('urn:li:organization:12345')
    expect(body.commentary).toHaveLength(2900)
    expect(body.commentary.endsWith('…')).toBe(true)
    expect(body.content.media).toEqual({
      id: 'urn:li:image:9',
      altText: 'Award cover',
    })
  })

  it('maps create-post failures and a missing post id header', async () => {
    const readySequence = () => [
      imageResponse('image/png'),
      jsonResponse({
        value: { uploadUrl: 'https://up.example/put', image: 'urn:li:image:1' },
      }),
      new Response(null, { status: 201 }),
      jsonResponse({ status: 'AVAILABLE' }),
    ]

    fetchMock
      .mockResolvedValueOnce(readySequence()[0])
      .mockResolvedValueOnce(readySequence()[1])
      .mockResolvedValueOnce(readySequence()[2])
      .mockResolvedValueOnce(readySequence()[3])
      .mockResolvedValueOnce(
        jsonResponse({ message: 'duplicate post' }, { status: 409 }),
      )

    await expect(
      publishImagePostToLinkedIn({
        commentary: 'Hello',
        imageUrl: 'https://cdn.example.com/cover.png',
      }),
    ).rejects.toThrow('duplicate post')

    fetchMock
      .mockResolvedValueOnce(readySequence()[0])
      .mockResolvedValueOnce(readySequence()[1])
      .mockResolvedValueOnce(readySequence()[2])
      .mockResolvedValueOnce(readySequence()[3])
      .mockResolvedValueOnce(jsonResponse({}, { status: 201 }))

    await expect(
      publishImagePostToLinkedIn({
        commentary: 'Hello',
        imageUrl: 'https://cdn.example.com/cover.png',
      }),
    ).rejects.toThrow('LinkedIn did not return post id header')
  })
})
