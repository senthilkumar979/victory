import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { COMPANY_LOGOS } from '@/constants/CompanyConstants'

import { ChatCompanyBadge } from './ChatCompanyBadge'

const frigateLogo = COMPANY_LOGOS.find((company) => company.name === 'Frigate')?.logo

afterEach(() => {
  cleanup()
})

describe('ChatCompanyBadge', () => {
  it('matches a trimmed name case-insensitively and shows the canonical label', () => {
    const { container } = render(<ChatCompanyBadge companyName="  fRiGaTe  " />)

    expect(screen.getByText('Frigate')).toBeInTheDocument()
    expect(screen.queryByText('fRiGaTe')).not.toBeInTheDocument()
    const logo = container.querySelector('img')
    expect(logo).toHaveAttribute('src', frigateLogo)
    expect(logo).toHaveAttribute('alt', '')
    expect(logo).toHaveAttribute('width', '12')
    expect(logo).toHaveAttribute('height', '12')
  })

  it('uses the larger mark for list size and skips a logo for an unknown company', () => {
    const { container, rerender } = render(
      <ChatCompanyBadge companyName="Frigate" size="list" />,
    )

    expect(container.querySelector('img')).toHaveAttribute('width', '16')

    rerender(<ChatCompanyBadge companyName="  Acme Labs  " size="list" />)

    expect(screen.getByText('Acme Labs')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('renders an empty label when the name is only whitespace', () => {
    const { container } = render(<ChatCompanyBadge companyName="   " />)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('span.font-medium')?.textContent).toBe('')
  })
})
