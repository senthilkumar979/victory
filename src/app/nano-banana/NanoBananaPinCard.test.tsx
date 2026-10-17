import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./nanoBananaDownload', () => ({
  downloadGeneratedImage: vi.fn(),
}))

import { downloadGeneratedImage } from './nanoBananaDownload'
import { NanoBananaLoadingPin, NanoBananaPinCard } from './NanoBananaPinCard'

const prompt =
  'Hello, world! This prompt is definitely longer than forty eight characters.'

afterEach(() => {
  cleanup()
  vi.mocked(downloadGeneratedImage).mockClear()
})

describe('NanoBananaPinCard', () => {
  it('downloads with the mime type and the first 48 prompt characters', async () => {
    const user = userEvent.setup()

    render(
      <NanoBananaPinCard
        pin={{
          id: 'pin-1',
          prompt,
          imageBase64: 'abc',
          mimeType: 'image/png',
        }}
      />,
    )

    const image = document.querySelector('img')
    expect(image).toHaveAttribute('src', 'data:image/png;base64,abc')

    await user.click(screen.getByRole('button', { name: /download/i }))

    expect(downloadGeneratedImage).toHaveBeenCalledWith(
      'abc',
      'image/png',
      prompt.slice(0, 48),
    )
  })

  it('does not offer a download while a pin is still generating', () => {
    render(<NanoBananaLoadingPin />)

    expect(screen.queryByRole('button', { name: /download/i })).toBeNull()
  })
})
