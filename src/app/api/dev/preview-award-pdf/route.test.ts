import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const renderAwardWinnerPdfBufferMock = vi.fn()

vi.mock('@/lib/renderAwardWinnerPdf', () => ({
  renderAwardWinnerPdfBuffer: (...args: unknown[]) =>
    renderAwardWinnerPdfBufferMock(...args),
}))

import { GET } from './route'

function previewRequest(search = ''): NextRequest {
  const url = `http://localhost:3000/api/dev/preview-award-pdf${search}`
  return new NextRequest(url)
}

describe('GET /api/dev/preview-award-pdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    renderAwardWinnerPdfBufferMock.mockResolvedValue(Buffer.from('%PDF-fake'))
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns 404 outside development so the preview cannot leak in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const response = await GET(previewRequest())

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      error: 'Award PDF preview is only enabled in development',
    })
    expect(renderAwardWinnerPdfBufferMock).not.toHaveBeenCalled()
  })

  it('renders a PDF in development using query params when provided', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    const response = await GET(
      previewRequest('?recipientName=Jane%20Doe&awardCategoryName=Outstanding'),
    )

    expect(renderAwardWinnerPdfBufferMock).toHaveBeenCalledWith({
      recipientName: 'Jane Doe',
      awardCategoryName: 'Outstanding',
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toBe(
      'inline; filename="award-certificate-preview.pdf"',
    )
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('trims query params and falls back to sample names when they are empty', async () => {
    vi.stubEnv('NODE_ENV', 'development')

    await GET(previewRequest('?recipientName=%20%20&awardCategoryName='))

    expect(renderAwardWinnerPdfBufferMock).toHaveBeenCalledWith({
      recipientName: 'Preview Winner',
      awardCategoryName: 'Sample Award Category',
    })
  })

  it('returns 500 when PDF rendering fails', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    renderAwardWinnerPdfBufferMock.mockRejectedValueOnce(new Error('boom'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const response = await GET(previewRequest())

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      error: 'Failed to render PDF',
    })
    errorSpy.mockRestore()
  })
})
