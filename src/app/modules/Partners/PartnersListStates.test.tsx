import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PartnersListStates } from './PartnersListStates'

afterEach(() => {
  cleanup()
})

describe('PartnersListStates', () => {
  it('lets loading win over an error and an empty list', () => {
    render(<PartnersListStates isLoading error="Network down" isEmpty />)

    expect(screen.getByText('Loading partners…')).toBeInTheDocument()
    expect(screen.queryByText(/Failed to load partners/)).toBeNull()
    expect(screen.queryByText('No partners yet.')).toBeNull()
  })

  it('lets an error win over the empty state', () => {
    render(
      <PartnersListStates isLoading={false} error="Network down" isEmpty />,
    )

    expect(
      screen.getByText('Failed to load partners. Network down'),
    ).toBeInTheDocument()
    expect(screen.queryByText('No partners yet.')).toBeNull()
  })

  it('shows the empty state only when loading and error are clear', () => {
    render(<PartnersListStates isLoading={false} error={null} isEmpty />)

    expect(screen.getByText('No partners yet.')).toBeInTheDocument()
  })

  it('renders nothing when the list can be shown', () => {
    const { container } = render(
      <PartnersListStates isLoading={false} error="" isEmpty={false} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
