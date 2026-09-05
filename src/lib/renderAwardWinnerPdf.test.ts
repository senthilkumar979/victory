import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const renderToBuffer = vi.fn()

vi.mock('@react-pdf/renderer', () => ({
  renderToBuffer: (...args: unknown[]) => renderToBuffer(...args),
}))

vi.mock('@/components/pdfx/AwardCertificatePdf', () => ({
  AwardCertificatePdf: (props: Record<string, unknown>) => props,
}))

import { MENTORBRIDGE_LONG_LOGO_URL } from '@/constants/CompanyConstants'
import { renderAwardWinnerPdfBuffer } from './renderAwardWinnerPdf'

describe('renderAwardWinnerPdfBuffer', () => {
  beforeEach(() => {
    renderToBuffer.mockReset()
    renderToBuffer.mockResolvedValue(Buffer.from('pdf'))
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('throws when the logo fetch fails and does not render a PDF', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    )

    await expect(
      renderAwardWinnerPdfBuffer({
        recipientName: 'Ada',
        awardCategoryName: 'Impact',
      }),
    ).rejects.toThrow('Logo fetch failed: 503')
    expect(renderToBuffer).not.toHaveBeenCalled()
  })

  it('defaults the logo MIME type to png when content-type is missing', async () => {
    const bytes = new Uint8Array([1, 2, 3])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => null },
        arrayBuffer: async () => bytes.buffer,
      }),
    )

    const pdf = await renderAwardWinnerPdfBuffer({
      recipientName: 'Ada Lovelace',
      awardCategoryName: 'Impact Award',
    })

    expect(fetch).toHaveBeenCalledWith(MENTORBRIDGE_LONG_LOGO_URL)
    const element = renderToBuffer.mock.calls[0]?.[0] as {
      props: {
        recipientName: string
        awardCategoryName: string
        logoDataUri: string
      }
    }
    expect(element.props).toEqual({
      recipientName: 'Ada Lovelace',
      awardCategoryName: 'Impact Award',
      logoDataUri: `data:image/png;base64,${Buffer.from(bytes).toString('base64')}`,
    })
    expect(pdf.equals(Buffer.from('pdf'))).toBe(true)
  })

  it('uses the first content-type token and still renders after a charset suffix', async () => {
    const bytes = new Uint8Array([9, 8, 7])
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        headers: { get: () => 'image/jpeg; charset=binary' },
        arrayBuffer: async () => bytes.buffer,
      }),
    )

    await renderAwardWinnerPdfBuffer({
      recipientName: 'Ada',
      awardCategoryName: 'Impact',
    })

    const element = renderToBuffer.mock.calls[0]?.[0] as {
      props: { logoDataUri: string }
    }
    expect(element.props.logoDataUri).toBe(
      `data:image/jpeg;base64,${Buffer.from(bytes).toString('base64')}`,
    )
  })
})
