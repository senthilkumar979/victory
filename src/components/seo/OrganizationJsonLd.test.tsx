import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/siteUrl', () => ({
  SITE_URL: 'https://mentor.test',
}))

import { OrganizationJsonLd } from './OrganizationJsonLd'

describe('OrganizationJsonLd', () => {
  it('emits EducationalOrganization structured data for the public site', () => {
    const { container } = render(<OrganizationJsonLd />)
    const script = container.querySelector('script[type="application/ld+json"]')
    const json = JSON.parse(script?.innerHTML ?? '{}') as Record<string, unknown>

    expect(json).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'MentorBridge',
      url: 'https://mentor.test',
    })
    expect(json.sameAs).toEqual([
      'https://www.linkedin.com/company/mentor-bridge-india/',
      'https://x.com/mentorbridgein',
      'https://www.youtube.com/@mentor-bridge-india',
    ])
    expect(script?.innerHTML).not.toContain('<script')
  })
})
