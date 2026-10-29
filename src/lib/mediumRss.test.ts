import { describe, expect, it } from 'vitest'

import {
  buildMediumRssUrl,
  extractCoverImageFromDescription,
  parseMediumRssXml,
} from '@/lib/mediumRss'

const SAMPLE_FEED = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" version="2.0">
  <channel>
    <title><![CDATA[Stories by Ada on Medium]]></title>
    <description><![CDATA[Stories by Ada on Medium]]></description>
    <link>https://medium.com/@ada</link>
    <item>
      <title><![CDATA[Hello &amp; welcome]]></title>
      <link>https://medium.com/@ada/hello-abc?source=rss</link>
      <dc:creator><![CDATA[Ada Lovelace]]></dc:creator>
      <pubDate>Wed, 28 Jun 2023 18:01:22 GMT</pubDate>
      <content:encoded><![CDATA[<img src="https://medium.com/_/stat?event=post.clientViewed&postId=abc" width="1" height="1" alt=""><img alt="" src="https://cdn-images-1.medium.com/max/1024/cover.jpeg" />]]></content:encoded>
    </item>
    <item>
      <title><![CDATA[No cover]]></title>
      <link>https://medium.com/@ada/no-cover</link>
      <dc:creator><![CDATA[Ada Lovelace]]></dc:creator>
      <pubDate>Thu, 29 Jun 2023 18:01:22 GMT</pubDate>
      <content:encoded><![CDATA[<p>Text only</p><img src="https://medium.com/_/stat?event=post.clientViewed" width="1" height="1" alt="">]]></content:encoded>
    </item>
  </channel>
</rss>`

const MIXED_FEED = `<rss><channel><title>Channel</title><description>Channel desc</description><link>https://medium.com/@ada</link>
<item><title>From description &amp;amp;</title><author>Not Used</author><dc:creator>Real Author</dc:creator><link>https://medium.com/@ada/desc</link><description><![CDATA[<img src='https://cdn.example/from-desc.png'>]]></description></item>
<item><title>Encoded wins</title><dc:creator>Ada</dc:creator><link>https://medium.com/@ada/encoded</link><description><![CDATA[<img src="https://cdn.example/desc-only.png">]]></description><content:encoded><![CDATA[<img src="https://medium.com/_/stat?e=1"><img src="https://cdn.example/cover.jpg?w=1024&amp;h=1">]]></content:encoded></item>
<item><title>No link</title><description>orphan</description></item>
</channel></rss>`

describe('parseMediumRssXml', () => {
  it('reads Medium RSS items, including content:encoded HTML', () => {
    const feed = parseMediumRssXml(SAMPLE_FEED)

    expect(feed.status).toBe('ok')
    expect(feed.feed.title).toBe('Stories by Ada on Medium')
    expect(feed.items).toHaveLength(2)
    expect(feed.items[0]).toMatchObject({
      title: 'Hello & welcome',
      author: 'Ada Lovelace',
      pubDate: 'Wed, 28 Jun 2023 18:01:22 GMT',
      link: 'https://medium.com/@ada/hello-abc?source=rss',
    })
    expect(extractCoverImageFromDescription(feed.items[0].description)).toBe(
      'https://cdn-images-1.medium.com/max/1024/cover.jpeg',
    )
    expect(extractCoverImageFromDescription(feed.items[1].description)).toBeNull()
  })

  it('rejects a non-RSS body', () => {
    expect(() => parseMediumRssXml('<html>Just a moment...</html>')).toThrow(
      /not an RSS document/,
    )
  })

  it('prefers encoded HTML, drops linkless items, and decodes entities once', () => {
    const feed = parseMediumRssXml(MIXED_FEED)

    expect(feed.feed).toEqual({
      title: 'Channel',
      description: 'Channel desc',
      link: 'https://medium.com/@ada',
    })
    expect(feed.items.map((item) => item.link)).toEqual([
      'https://medium.com/@ada/desc',
      'https://medium.com/@ada/encoded',
    ])
    expect(feed.items[0]).toMatchObject({
      title: 'From description &amp;',
      author: 'Real Author',
    })
    expect(extractCoverImageFromDescription(feed.items[0].description)).toBe(
      'https://cdn.example/from-desc.png',
    )
    expect(extractCoverImageFromDescription(feed.items[1].description)).toBe(
      'https://cdn.example/cover.jpg?w=1024&h=1',
    )
  })

  it('returns no items for a channel that has not published posts', () => {
    const feed = parseMediumRssXml(
      '<rss><channel><title>Empty</title><description></description><link>https://medium.com/@ada</link></channel></rss>',
    )

    expect(feed.status).toBe('ok')
    expect(feed.items).toEqual([])
    expect(feed.feed.title).toBe('Empty')
  })
})

describe('extractCoverImageFromDescription', () => {
  it('skips tracking pixels and keeps the first real image', () => {
    expect(
      extractCoverImageFromDescription(
        `<img src="https://medium.com/_/stat?e=1" /><img src='https://cdn.example/a.png' /><img src="https://cdn.example/b.png" />`,
      ),
    ).toBe('https://cdn.example/a.png')
    expect(
      extractCoverImageFromDescription('<img src="https://medium.com/_/stat?e=1" />'),
    ).toBeNull()
    expect(extractCoverImageFromDescription('')).toBeNull()
  })
})

describe('buildMediumRssUrl', () => {
  it('normalizes an optional @ prefix', () => {
    expect(buildMediumRssUrl('@Ada')).toBe('https://medium.com/feed/@Ada')
    expect(buildMediumRssUrl(' Ada ')).toBe('https://medium.com/feed/@Ada')
  })

  it('encodes characters that would change the feed path', () => {
    expect(buildMediumRssUrl('ada/blog')).toBe('https://medium.com/feed/@ada%2Fblog')
    expect(buildMediumRssUrl(' @ada blog ')).toBe(
      'https://medium.com/feed/@ada%20blog',
    )
  })
})
