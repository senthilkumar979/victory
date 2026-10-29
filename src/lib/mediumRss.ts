const MEDIUM_RSS_BASE = 'https://medium.com/feed'
const TRACKING_PIXEL_PATH = 'medium.com/_/stat'

const FEED_HEADERS = {
  Accept: 'application/rss+xml, application/xml, text/xml, */*',
  'User-Agent': 'MentorBridge/1.0 (blog-sync)',
}

export interface MediumRssItem {
  title: string
  author: string
  pubDate: string
  description: string
  link: string
}

export interface MediumRssFeed {
  status: 'ok'
  feed: {
    title: string
    description: string
    link: string
  }
  items: MediumRssItem[]
}

function decodeXmlText(raw: string): string {
  const cdata = raw.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/)
  const text = cdata ? cdata[1] : raw
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .trim()
}

function readTag(block: string, tag: string): string {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = block.match(
    new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)</${escaped}>`, 'i'),
  )
  return match ? decodeXmlText(match[1]) : ''
}

export function buildMediumRssUrl(username: string): string {
  const normalized = username.trim().replace(/^@/, '')
  return `${MEDIUM_RSS_BASE}/@${encodeURIComponent(normalized)}`
}

export function extractCoverImageFromDescription(
  description: string,
): string | null {
  const pattern = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi
  for (const match of description.matchAll(pattern)) {
    const src = match[1]
    if (!src || src.includes(TRACKING_PIXEL_PATH)) continue
    return src
  }
  return null
}

export function parseMediumRssXml(xml: string): MediumRssFeed {
  if (!xml.includes('<rss') && !xml.includes('<channel')) {
    throw new Error('Failed to fetch RSS feed: response was not an RSS document')
  }

  const channelBlock = xml.split(/<item\b/i)[0] ?? xml
  const itemBlocks = xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi) ?? []

  const items = itemBlocks
    .map((block) => ({
      title: readTag(block, 'title'),
      author: readTag(block, 'dc:creator'),
      pubDate: readTag(block, 'pubDate'),
      description:
        readTag(block, 'content:encoded') || readTag(block, 'description'),
      link: readTag(block, 'link'),
    }))
    .filter((item) => item.link.length > 0)

  return {
    status: 'ok',
    feed: {
      title: readTag(channelBlock, 'title'),
      description: readTag(channelBlock, 'description'),
      link: readTag(channelBlock, 'link'),
    },
    items,
  }
}

export async function fetchMediumRssFeed(
  username: string,
): Promise<MediumRssFeed> {
  const response = await fetch(buildMediumRssUrl(username), {
    headers: FEED_HEADERS,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(
      `Failed to fetch RSS feed: ${response.status} ${response.statusText}`,
    )
  }

  return parseMediumRssXml(await response.text())
}
