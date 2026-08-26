import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  renderChatBoldAndMentorbridgeEmails,
  renderChatBoldSegments,
} from './renderChatBoldSegments'

afterEach(() => {
  cleanup()
})

describe('renderChatBoldSegments', () => {
  it('returns null for empty text', () => {
    expect(renderChatBoldSegments('')).toBeNull()
  })

  it('renders matched **segments** as strong and leaves unmatched markers as text', () => {
    const { container } = render(
      <>{renderChatBoldSegments('Hello **Ada** and **unclosed')}</>,
    )

    expect(container.querySelector('strong')).toHaveTextContent('Ada')
    expect(container).toHaveTextContent('Hello Ada and **unclosed')
  })
})

describe('renderChatBoldAndMentorbridgeEmails', () => {
  it('bolds mentorbridge.in addresses but not other domains', () => {
    const { container } = render(
      <>
        {renderChatBoldAndMentorbridgeEmails(
          'Write **mail@mentorbridge.in** or other@example.com',
        )}
      </>,
    )

    expect(screen.getByText('mail@mentorbridge.in')).toBeInTheDocument()
    expect(container.querySelectorAll('strong').length).toBeGreaterThan(0)
    expect(container).toHaveTextContent('other@example.com')
    expect(
      [...container.querySelectorAll('strong')].some(
        (node) => node.textContent === 'other@example.com',
      ),
    ).toBe(false)
  })
})
