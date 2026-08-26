import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/components/visitor-chat/ChatCompanyBadge', () => ({
  ChatCompanyBadge: ({
    companyName,
    size,
  }: {
    companyName: string
    size?: string
  }) => (
    <span data-testid="company-badge" data-size={size}>
      {companyName}
    </span>
  ),
}))

import { renderTextWithCompaniesAndBold } from './chatCompanyRichText'

afterEach(() => {
  cleanup()
})

describe('renderTextWithCompaniesAndBold', () => {
  it('returns null for empty text', () => {
    expect(renderTextWithCompaniesAndBold('')).toBeNull()
  })

  it('replaces whole-word company names and uses list size at line start', () => {
    render(<>{renderTextWithCompaniesAndBold('Codifi hired Ada')}</>)

    const badge = screen.getByTestId('company-badge')
    expect(badge).toHaveTextContent('Codifi')
    expect(badge).toHaveAttribute('data-size', 'list')
    expect(screen.getByText(/hired Ada/)).toBeInTheDocument()
  })

  it('does not match company names inside larger words', () => {
    render(<>{renderTextWithCompaniesAndBold('Codification workshop')}</>)

    expect(screen.queryByTestId('company-badge')).not.toBeInTheDocument()
    expect(screen.getByText('Codification workshop')).toBeInTheDocument()
  })

  it('uses inline badge size when the company is mid-sentence', () => {
    render(<>{renderTextWithCompaniesAndBold('Join Codifi today')}</>)

    expect(screen.getByTestId('company-badge')).toHaveAttribute(
      'data-size',
      'inline',
    )
  })
})
