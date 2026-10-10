import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ProductDetailDrawer } from './ProductDetailDrawer'
import type { Product } from './product.types'

vi.mock('next/image', () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <span data-alt={alt} data-src={src} />
  ),
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    children,
    isOpen,
  }: {
    children: ReactNode
    isOpen: boolean
  }) => (isOpen ? <section>{children}</section> : null)

  function DrawerTitle({
    children,
    description,
  }: {
    children: ReactNode
    description?: string
  }) {
    return (
      <h2>
        {children}
        {description ? <p>{description}</p> : null}
      </h2>
    )
  }

  function DrawerBody({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }

  function DrawerFooter({ children }: { children: ReactNode }) {
    return <footer>{children}</footer>
  }

  const Drawer = Object.assign(DrawerRoot, {
    Title: DrawerTitle,
    Body: DrawerBody,
    Footer: DrawerFooter,
  })

  return { Drawer }
})

afterEach(() => {
  cleanup()
})

const product: Product = {
  id: 'stublab',
  name: 'StubLab',
  category: 'Developer Tools',
  tagline: 'Mock APIs',
  features: ['Mocks', 'Modeling', 'Collaboration', 'Versions'],
  impact: '500 teams',
  websiteUrl: 'https://stublab.mentorbridge.in/',
  detailPageUrl: null,
  imageUrl: 'https://cdn.example/stublab.png',
  theme: 'violet',
  icon: 'code2',
  story: {
    lead: 'Stub without a database.',
    sections: [
      {
        title: 'Who it is for',
        paragraphs: ['Frontend teams.', 'QA engineers.'],
      },
    ],
  },
}

describe('ProductDetailDrawer', () => {
  it('renders nothing when no product is selected', () => {
    const { container } = render(
      <ProductDetailDrawer
        product={null}
        icon={null}
        isOpen
        onClose={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('lists every feature and links the product site in a new tab', () => {
    render(
      <ProductDetailDrawer
        product={product}
        icon={null}
        isOpen
        onClose={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('heading', { name: /StubLab/ }),
    ).toBeInTheDocument()
    expect(screen.getByText('Developer Tools')).toBeInTheDocument()
    expect(screen.getByText('Mocks')).toBeInTheDocument()
    expect(screen.getByText('Versions')).toBeInTheDocument()
    expect(screen.getByText('Stub without a database.')).toBeInTheDocument()
    expect(screen.getByText('Frontend teams.')).toBeInTheDocument()

    const site = screen.getByRole('link', { name: 'Visit product site' })
    expect(site).toHaveAttribute('href', 'https://stublab.mentorbridge.in/')
    expect(site).toHaveAttribute('target', '_blank')
    expect(site).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps the drawer closed when isOpen is false', () => {
    render(
      <ProductDetailDrawer
        product={product}
        icon={null}
        isOpen={false}
        onClose={vi.fn()}
      />,
    )

    expect(screen.queryByRole('heading', { name: /StubLab/ })).toBeNull()
  })
})
