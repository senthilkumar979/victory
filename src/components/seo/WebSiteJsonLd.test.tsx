import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/siteUrl', () => ({
  SITE_URL: 'https://mentor.test',
}))

import { WebSiteJsonLd } from './WebSiteJsonLd'

describe('WebSiteJsonLd', () => {
  it('emits WebSite structured data with an en-IN publisher', () => {
    const { container } = render(<WebSiteJsonLd />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const json = JSON.parse(script?.innerHTML ?? '{}') as {
      publisher: { url: string; logo: { '@type': string; url: string } }
    }

    expect(json).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'MentorBridge',
      url: 'https://mentor.test',
      inLanguage: 'en-IN',
      publisher: {
        '@type': 'Organization',
        name: 'MentorBridge',
        url: 'https://mentor.test',
      },
    })
    expect(json.publisher.logo).toMatchObject({
      '@type': 'ImageObject',
      url: expect.stringContaining('favicon.ico'),
    })
    expect(script?.innerHTML).not.toContain('<script')
  })
})
