import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { GoogleDocPreview } from './GoogleDocPreview'

afterEach(() => {
  cleanup()
})

describe('GoogleDocPreview', () => {
  it('renders a preview iframe for a valid Google Doc URL', () => {
    render(
      <GoogleDocPreview url="https://docs.google.com/document/d/abc-123_DOC/edit" />,
    )

    expect(screen.getByTitle('Google Doc preview')).toHaveAttribute(
      'src',
      'https://docs.google.com/document/d/abc-123_DOC/preview',
    )
  })

  it('renders nothing for an empty or non-Google-Doc URL', () => {
    const { rerender, container } = render(
      <GoogleDocPreview url="https://example.com/not-a-doc" />,
    )
    expect(screen.queryByTitle('Google Doc preview')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()

    rerender(<GoogleDocPreview url="" />)
    expect(screen.queryByTitle('Google Doc preview')).not.toBeInTheDocument()
    expect(container).toBeEmptyDOMElement()
  })
})
