import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchMediumRssFeed } from '@/lib/mediumRss'

const FEED_REQUEST = {
  headers: {
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
    'User-Agent': 'MentorBridge/1.0 (blog-sync)',
  },
  cache: 'no-store',
} as const

const MINIMAL_FEED = `<rss><channel><title><![CDATA[Hello &amp; welcome]]></title><description>Feed</description><link>https://medium.com/@ada</link><item><title><![CDATA[Hello &amp; welcome]]></title><link>https://medium.com/@ada/hello</link><dc:creator>Ada</dc:creator><pubDate>Wed, 28 Jun 2023 18:01:22 GMT</pubDate></item></channel></rss>`

describe('fetchMediumRssFeed', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads Medium RSS directly and parses the XML body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => MINIMAL_FEED,
    })
    vi.stubGlobal('fetch', fetchMock)

    const feed = await fetchMediumRssFeed(' @Ada ')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://medium.com/feed/@Ada',
      FEED_REQUEST,
    )
    expect(feed.status).toBe('ok')
    expect(feed.items[0]).toMatchObject({
      title: 'Hello & welcome',
      link: 'https://medium.com/@ada/hello',
    })
  })

  it('reports the HTTP status and does not read an error body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => {
          throw new Error('body should not be read')
        },
      }),
    )

    await expect(fetchMediumRssFeed('ada')).rejects.toThrow(
      'Failed to fetch RSS feed: 403 Forbidden',
    )
  })

  it('rejects an HTML challenge returned with HTTP 200', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => '<html>Just a moment...</html>',
      }),
    )

    await expect(fetchMediumRssFeed('ada')).rejects.toThrow(/not an RSS document/)
  })

  it('propagates network failures instead of treating them as an empty feed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    await expect(fetchMediumRssFeed('ada')).rejects.toThrow('network down')
  })
})
