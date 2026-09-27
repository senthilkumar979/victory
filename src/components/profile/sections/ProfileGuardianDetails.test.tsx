import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { ProfileGuardianDetails } from './ProfileGuardianDetails'

afterEach(() => {
  cleanup()
})

describe('ProfileGuardianDetails', () => {
  it('treats missing and whitespace-only notes as empty and hides the admin badge', () => {
    render(
      <ProfileGuardianDetails
        fatherGuardianDetails="   "
        motherDetails={undefined}
      />,
    )

    expect(screen.getByText('No guardian details recorded.')).toBeInTheDocument()
    expect(screen.queryByText('Admin only')).not.toBeInTheDocument()
    expect(screen.queryByText('Father\'s / Guardian\'s details')).not.toBeInTheDocument()
  })

  it('shows only the populated guardian note and marks the section admin-only', () => {
    render(
      <ProfileGuardianDetails
        fatherGuardianDetails="  Father lives in Chennai  "
        motherDetails="   "
      />,
    )

    expect(screen.getByText('Admin only')).toBeInTheDocument()
    expect(document.querySelector('p')?.textContent).toBe('  Father lives in Chennai  ')
    expect(screen.queryByText("Mother's details")).not.toBeInTheDocument()
    expect(screen.queryByText('No guardian details recorded.')).not.toBeInTheDocument()
  })
})
