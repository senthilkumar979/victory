import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CHAT_NAME_COLOR, renderChatRichContent } from './renderChatRichContent'

vi.mock('@/components/visitor-chat/ChatCompanyBadge', () => ({
  ChatCompanyBadge: ({ companyName }: { companyName: string }) => (
    <span data-testid="company-badge">{companyName}</span>
  ),
}))

afterEach(() => {
  cleanup()
})

describe('renderChatRichContent', () => {
  it('returns null for empty input', () => {
    expect(renderChatRichContent('')).toBeNull()
  })

  it('renders NAME and SKILL markers and strips trailing punctuation from links', () => {
    const { container } = render(
      <>
        {renderChatRichContent(
          'Meet [[NAME]]Ada[[/NAME]] who knows [[SKILL]]React[[/SKILL]]. See https://mentorbridge.in/students.',
        )}
      </>,
    )

    expect(screen.getByText('Ada').parentElement).toHaveStyle({
      color: CHAT_NAME_COLOR,
    })
    expect(screen.getByText('React').parentElement).toHaveClass('font-semibold')

    const link = screen.getByRole('link', { name: /open/i })
    expect(link).toHaveAttribute('href', 'https://mentorbridge.in/students')
    expect(container).not.toHaveTextContent('[[NAME]]')
  })

  it('renders COMPANY markers and mailto links as Email actions', () => {
    render(
      <>
        {renderChatRichContent(
          '[[COMPANY]]Codifi[[/COMPANY]] — mailto:mail@mentorbridge.in',
        )}
      </>,
    )

    expect(screen.getByTestId('company-badge')).toHaveTextContent('Codifi')
    const email = screen.getByRole('link', { name: /email/i })
    expect(email).toHaveAttribute('href', 'mailto:mail@mentorbridge.in')
  })

  it('leaves unmatched ** markers as literal text', () => {
    const { container } = render(
      <>{renderChatRichContent('Start **bold without close')}</>,
    )
    expect(container).toHaveTextContent('Start **bold without close')
  })
})
