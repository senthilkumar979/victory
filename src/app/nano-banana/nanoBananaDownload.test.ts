import { afterEach, describe, expect, it, vi } from 'vitest'

import { downloadGeneratedImage } from './nanoBananaDownload'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('downloadGeneratedImage', () => {
  it('sanitizes the filename, caps length, and picks an extension from the MIME type', () => {
    const click = vi.fn()
    const createElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      href: '',
      download: '',
      rel: '',
    } as unknown as HTMLAnchorElement)

    downloadGeneratedImage(
      'abc',
      'image/webp',
      'hello <world>!!! 123456789012345678901234567890EXTRA',
    )

    expect(createElement).toHaveBeenCalledWith('a')
    const anchor = createElement.mock.results[0]?.value as HTMLAnchorElement
    expect(anchor.href).toBe('data:image/webp;base64,abc')
    expect(anchor.download).toBe(
      'hello world 1234567890123456789012345678.webp',
    )
    expect(anchor.rel).toBe('noopener')
    expect(click).toHaveBeenCalled()
  })

  it('falls back to nano-banana.png for empty snippets and unknown MIME types', () => {
    const click = vi.fn()
    vi.spyOn(document, 'createElement').mockReturnValue({
      click,
      href: '',
      download: '',
      rel: '',
    } as unknown as HTMLAnchorElement)

    downloadGeneratedImage('xyz', 'application/octet-stream', '@@@')

    const anchor = (document.createElement as unknown as ReturnType<typeof vi.fn>)
      .mock.results[0]?.value as HTMLAnchorElement
    expect(anchor.download).toBe('nano-banana.png')
  })

  it('maps jpeg MIME types to .jpg', () => {
    vi.spyOn(document, 'createElement').mockReturnValue({
      click: vi.fn(),
      href: '',
      download: '',
      rel: '',
    } as unknown as HTMLAnchorElement)

    downloadGeneratedImage('x', 'image/jpeg', 'portrait')

    const anchor = (document.createElement as unknown as ReturnType<typeof vi.fn>)
      .mock.results[0]?.value as HTMLAnchorElement
    expect(anchor.download).toBe('portrait.jpg')
  })
})
