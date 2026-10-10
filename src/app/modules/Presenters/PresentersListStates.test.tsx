import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { PresentersListStates } from './PresentersListStates'

afterEach(() => {
  cleanup()
})

describe('PresentersListStates', () => {
  it('lets loading win over an error and an empty list', () => {
    render(<PresentersListStates isLoading error="Network down" isEmpty />)

    expect(screen.getByText('Loading presenters…')).toBeInTheDocument()
    expect(screen.queryByText(/Failed to load presenters/)).toBeNull()
    expect(screen.queryByText('No presenters created yet.')).toBeNull()
  })

  it('lets an error win over the empty state', () => {
    render(
      <PresentersListStates isLoading={false} error="Network down" isEmpty />,
    )

    expect(
      screen.getByText('Failed to load presenters. Network down'),
    ).toBeInTheDocument()
    expect(screen.queryByText('No presenters created yet.')).toBeNull()
  })

  it('shows the empty state only when loading and error are clear', () => {
    render(<PresentersListStates isLoading={false} error={null} isEmpty />)

    expect(screen.getByText('No presenters created yet.')).toBeInTheDocument()
  })

  it('renders nothing when the list can be shown', () => {
    const { container } = render(
      <PresentersListStates isLoading={false} error="" isEmpty={false} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
