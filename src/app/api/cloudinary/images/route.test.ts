import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { searchApi } = vi.hoisted(() => {
  const api = {
    expression: vi.fn(),
    sort_by: vi.fn(),
    max_results: vi.fn(),
    execute: vi.fn(),
  }
  api.expression.mockReturnValue(api)
  api.sort_by.mockReturnValue(api)
  api.max_results.mockReturnValue(api)
  return { searchApi: api }
})

vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    search: searchApi,
  },
}))

import { GET } from './route'

const ORIGINAL_ENV = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
}

function setCloudinaryEnv() {
  process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud'
  process.env.CLOUDINARY_API_KEY = 'key'
  process.env.CLOUDINARY_API_SECRET = 'secret'
}

function makeRequest(query = '') {
  return new Request(
    `http://localhost/api/cloudinary/images${query}`,
  ) as never
}

describe('GET /api/cloudinary/images', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    searchApi.expression.mockReturnValue(searchApi)
    searchApi.sort_by.mockReturnValue(searchApi)
    searchApi.max_results.mockReturnValue(searchApi)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    setCloudinaryEnv()
  })

  afterEach(() => {
    process.env.CLOUDINARY_CLOUD_NAME = ORIGINAL_ENV.CLOUDINARY_CLOUD_NAME
    process.env.CLOUDINARY_API_KEY = ORIGINAL_ENV.CLOUDINARY_API_KEY
    process.env.CLOUDINARY_API_SECRET = ORIGINAL_ENV.CLOUDINARY_API_SECRET
  })

  it('returns 500 when Cloudinary credentials are missing', async () => {
    delete process.env.CLOUDINARY_CLOUD_NAME
    delete process.env.CLOUDINARY_API_KEY
    delete process.env.CLOUDINARY_API_SECRET

    const response = await GET(makeRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      error:
        'Cloudinary configuration is missing. Please check your environment variables.',
    })
    expect(searchApi.execute).not.toHaveBeenCalled()
  })

  it('maps search failures without calling resource mapping', async () => {
    searchApi.execute.mockRejectedValue(new Error('rate limited'))

    const response = await GET(makeRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      error: 'Failed to search Cloudinary',
      details: 'rate limited',
    })
  })

  it('returns an empty list when the folder has no resources', async () => {
    searchApi.execute.mockResolvedValue({ resources: [] })

    const response = await GET(makeRequest('?folder=events'))

    expect(searchApi.expression).toHaveBeenCalledWith('folder:events')
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      images: [],
      message: 'No images found in folder: events',
    })
  })

  it('builds transformed image URLs with defaults for folder and quality', async () => {
    searchApi.execute.mockResolvedValue({
      resources: [
        { public_id: 'gallery/photo-1', width: 800, height: 600 },
      ],
    })

    const response = await GET(makeRequest())
    const body = await response.json()

    expect(searchApi.expression).toHaveBeenCalledWith('folder:gallery')
    expect(searchApi.sort_by).toHaveBeenCalledWith('created_at', 'desc')
    expect(searchApi.max_results).toHaveBeenCalledWith(50)
    expect(response.status).toBe(200)
    expect(body.images).toEqual([
      {
        id: 'gallery/photo-1',
        src: 'https://res.cloudinary.com/demo-cloud/image/upload/f_auto,q_auto/gallery/photo-1',
        title: 'gallery',
        alt: 'Image from gallery folder',
        public_id: 'gallery/photo-1',
        width: 800,
        height: 600,
        folder: 'gallery',
      },
    ])
  })
})
