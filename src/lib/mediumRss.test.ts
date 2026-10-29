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
})

describe('buildMediumRssUrl', () => {
  it('normalizes an optional @ prefix', () => {
    expect(buildMediumRssUrl('@Ada')).toBe('https://medium.com/feed/@Ada')
    expect(buildMediumRssUrl(' Ada ')).toBe('https://medium.com/feed/@Ada')
  })
})
