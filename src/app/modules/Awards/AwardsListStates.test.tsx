import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { AwardsListStates } from './AwardsListStates'

afterEach(() => {
  cleanup()
})

describe('AwardsListStates', () => {
  it('lets loading win over an error and an empty list', () => {
    render(<AwardsListStates isLoading error="Network down" isEmpty />)

    expect(screen.getByText('Loading awards…')).toBeInTheDocument()
    expect(screen.queryByText(/Failed to load awards/)).toBeNull()
    expect(screen.queryByText('No awards created yet.')).toBeNull()
  })

  it('lets an error win over the empty state', () => {
    render(
      <AwardsListStates isLoading={false} error="Network down" isEmpty />,
    )

    expect(screen.getByText('Failed to load awards. Network down')).toBeInTheDocument()
    expect(screen.queryByText('No awards created yet.')).toBeNull()
  })

  it('shows the empty state only when loading and error are clear', () => {
    render(<AwardsListStates isLoading={false} error={null} isEmpty />)

    expect(screen.getByText('No awards created yet.')).toBeInTheDocument()
  })

  it('renders nothing when the list can be shown', () => {
    const { container } = render(
      <AwardsListStates isLoading={false} error="" isEmpty={false} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
