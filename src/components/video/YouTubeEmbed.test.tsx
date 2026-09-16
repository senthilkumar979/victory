import { cleanup, render } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { getYoutubeEmbedUrl } from '@/lib/sessionVideos/youtubeUtils'

import { YouTubeEmbed } from './YouTubeEmbed'

afterEach(() => {
  cleanup()
})

describe('YouTubeEmbed', () => {
  it('embeds via the privacy-enhanced URL without related videos', () => {
    const { container } = render(
      <YouTubeEmbed videoId="dQw4w9WgXcQ" title="React hooks" />,
    )

    const iframe = container.querySelector('iframe')
    expect(iframe).toHaveAttribute(
      'src',
      getYoutubeEmbedUrl('dQw4w9WgXcQ'),
    )
    expect(iframe?.getAttribute('src')).toContain('youtube-nocookie.com')
    expect(iframe?.getAttribute('src')).toContain('rel=0')
    expect(iframe).toHaveAttribute('title', 'React hooks')
  })
})
