import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProductCard } from './ProductCard'
import type { Product } from './product.types'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span data-alt={alt} data-src={src} />
  ),
}))

vi.mock('framer-motion', () => ({
  motion: new Proxy(
    {},
    {
      get: (_target, tag) => tag,
    },
  ),
}))

afterEach(() => {
  cleanup()
})

const product: Product = {
  id: 'securosphere',
  name: 'SecuroSphere',
  category: 'Security Platform',
  tagline: 'Auth for modern apps',
  features: ['MFA', 'SSO', 'RBAC', 'Monitoring'],
  impact: '10k sessions',
  websiteUrl: 'https://securosphere.mentorbridge.in/',
  detailPageUrl: null,
  imageUrl: 'https://cdn.example/securosphere.png',
  theme: 'emerald',
  icon: 'shield',
  story: { lead: 'Lead', sections: [] },
}

describe('ProductCard', () => {
  it('shows only the first three features and keeps explore separate from the website', async () => {
    const user = userEvent.setup()
    const onOpen = vi.fn()
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)

    render(<ProductCard product={product} index={0} onOpen={onOpen} />)

    expect(screen.getByText('MFA')).toBeInTheDocument()
    expect(screen.getByText('SSO')).toBeInTheDocument()
    expect(screen.getByText('RBAC')).toBeInTheDocument()
    expect(screen.queryByText('Monitoring')).toBeNull()
    expect(document.querySelector('[data-alt="SecuroSphere"]')).toHaveAttribute(
      'data-src',
      product.imageUrl,
    )

    await user.click(screen.getByRole('button', { name: 'Explore' }))
    expect(onOpen).toHaveBeenCalledWith(product)
    expect(open).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Visit Website' }))
    expect(open).toHaveBeenCalledWith(product.websiteUrl, '_blank')

    open.mockRestore()
  })
})
