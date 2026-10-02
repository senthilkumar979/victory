import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { DrawerResources } from './DrawerResources'

describe('DrawerResources', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing when there are no resources', () => {
    const { container } = render(<DrawerResources resources={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('groups known types in section order and sends unknown types to Other', () => {
    render(
      <DrawerResources
        resources={[
          {
            title: 'Clip',
            url: 'https://example.com/clip',
            type: 'video',
          },
          {
            title: 'Spec',
            url: 'https://example.com/spec',
            type: 'article',
          },
          { title: 'Mystery', url: 'https://example.com/mystery' },
          {
            title: 'Podcast',
            url: 'https://example.com/podcast',
            type: 'podcast' as 'article',
          },
        ]}
      />,
    )

    const headings = screen
      .getAllByText(/^(Article|Video|Other)$/)
      .map((node) => node.textContent)
    expect(headings).toEqual(['Article', 'Video', 'Other'])
    expect(screen.queryByText('Course')).not.toBeInTheDocument()
    expect(screen.queryByText('Link')).not.toBeInTheDocument()

    const links = screen.getAllByRole('link').map((link) => link.textContent)
    expect(links).toEqual([
      expect.stringContaining('Spec'),
      expect.stringContaining('Clip'),
      expect.stringContaining('Mystery'),
      expect.stringContaining('Podcast'),
    ])

    const spec = screen.getByRole('link', { name: /Spec/ })
    expect(spec).toHaveAttribute('href', 'https://example.com/spec')
    expect(spec).toHaveAttribute('target', '_blank')
    expect(spec).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
