import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MeetingsListStates } from './MeetingsListStates'

afterEach(() => {
  cleanup()
})

describe('MeetingsListStates', () => {
  it('lets loading win over an error and an empty list', () => {
    render(<MeetingsListStates isLoading error="Network down" isEmpty />)

    expect(screen.getByText('Loading meetings…')).toBeInTheDocument()
    expect(screen.queryByText(/Failed to load meetings/)).toBeNull()
    expect(screen.queryByText('No meetings created yet.')).toBeNull()
  })

  it('lets an error win over the empty state', () => {
    render(
      <MeetingsListStates isLoading={false} error="Network down" isEmpty />,
    )

    expect(
      screen.getByText('Failed to load meetings. Network down'),
    ).toBeInTheDocument()
    expect(screen.queryByText('No meetings created yet.')).toBeNull()
  })

  it('shows the empty state only when loading and error are clear', () => {
    render(<MeetingsListStates isLoading={false} error={null} isEmpty />)

    expect(screen.getByText('No meetings created yet.')).toBeInTheDocument()
  })

  it('renders nothing when the list can be shown', () => {
    const { container } = render(
      <MeetingsListStates isLoading={false} error="" isEmpty={false} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
