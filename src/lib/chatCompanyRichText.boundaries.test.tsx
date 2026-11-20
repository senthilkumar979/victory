import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  COMPANY_LOGOS,
  COMPANY_LOGOS_SORTED_LONGEST_FIRST,
} from '@/constants/CompanyConstants'

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

describe('company logo match order', () => {
  it('lists every company once, longest name first', () => {
    const lengths = COMPANY_LOGOS_SORTED_LONGEST_FIRST.map(
      (entry) => entry.name.length,
    )

    expect(COMPANY_LOGOS_SORTED_LONGEST_FIRST).toHaveLength(COMPANY_LOGOS.length)
    expect(lengths).toEqual([...lengths].sort((a, b) => b - a))
    expect(new Set(COMPANY_LOGOS_SORTED_LONGEST_FIRST.map((entry) => entry.name)).size).toBe(
      COMPANY_LOGOS.length,
    )
  })
})

describe('renderTextWithCompaniesAndBold boundaries', () => {
  it('badges the catalog name when the mention differs in case', () => {
    render(<>{renderTextWithCompaniesAndBold('alumni joined teksage')}</>)

    const badge = screen.getByTestId('company-badge')
    expect(badge).toHaveTextContent('Teksage')
    expect(badge).toHaveAttribute('data-size', 'inline')
  })

  it('matches a company beside punctuation and keeps the full legal name', () => {
    render(
      <>
        {renderTextWithCompaniesAndBold(
          'Offers: Codifi, then Covai HelloTruck Pvt Ltd.',
        )}
      </>,
    )

    const badges = screen.getAllByTestId('company-badge')
    expect(badges.map((badge) => badge.textContent)).toEqual([
      'Codifi',
      'Covai HelloTruck Pvt Ltd',
    ])
    expect(badges[0]).toHaveAttribute('data-size', 'inline')
  })

  it('does not badge a fragment of a longer company name', () => {
    render(<>{renderTextWithCompaniesAndBold('HelloTruck only')}</>)

    expect(screen.queryByTestId('company-badge')).not.toBeInTheDocument()
    expect(screen.getByText('HelloTruck only')).toBeInTheDocument()
  })
})
