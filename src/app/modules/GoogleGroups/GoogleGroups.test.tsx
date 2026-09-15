import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { GoogleGroupFormState } from './GoogleGroup.types'
import { GoogleGroups } from './GoogleGroups'

const hookState = {
  groups: [] as GoogleGroupFormState[],
  isLoading: false,
  error: null as string | null,
  refetch: vi.fn(),
}

vi.mock('@/hooks/useGoogleGroups', () => ({
  useGoogleGroups: () => hookState,
}))

vi.mock('./AddGoogleGroup', () => ({
  AddGoogleGroup: ({
    show,
    groupToEdit,
    onSucess,
  }: {
    show: boolean
    groupToEdit?: GoogleGroupFormState
    onSucess: () => void
  }) =>
    show ? (
      <div>
        <p>form-mode:{groupToEdit?.id ?? 'create'}</p>
        <p>form-name:{groupToEdit?.name ?? ''}</p>
        <p>form-email:{groupToEdit?.email ?? ''}</p>
        <button type="button" onClick={onSucess}>
          Complete save
        </button>
      </div>
    ) : null,
}))

vi.mock('./DeleteGoogleGroup', () => ({
  DeleteGoogleGroup: ({
    show,
    groupToDelete,
    onDelete,
  }: {
    show: boolean
    groupToDelete: GoogleGroupFormState | null
    onDelete: () => void
  }) =>
    show ? (
      <div>
        <p>delete:{groupToDelete?.email ?? 'none'}</p>
        <button type="button" onClick={onDelete}>
          Confirm delete
        </button>
      </div>
    ) : null,
}))

const group: GoogleGroupFormState = {
  id: 'grp-1',
  name: 'Backend cohort',
  email: 'backend@mentorbridge.in',
}

function rowButtons(name: string) {
  const row = screen.getByText(name).closest('tr')
  if (!(row instanceof HTMLElement)) throw new Error(`row missing for ${name}`)
  return within(row).getAllByRole('button')
}

beforeEach(() => {
  hookState.groups = []
  hookState.isLoading = false
  hookState.error = null
  hookState.refetch.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('GoogleGroups', () => {
  it('shows loading, error, and empty states without the table', () => {
    hookState.isLoading = true
    const { rerender } = render(<GoogleGroups />)
    expect(screen.getByText('Loading Google Groups…')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    hookState.isLoading = false
    hookState.error = 'directory down'
    rerender(<GoogleGroups />)
    expect(screen.getByText(/Failed to load Google Groups/)).toHaveTextContent(
      'directory down',
    )
    expect(screen.queryByText('No Google Groups configured yet.')).not.toBeInTheDocument()

    hookState.error = null
    rerender(<GoogleGroups />)
    expect(screen.getByText('No Google Groups configured yet.')).toBeInTheDocument()
  })

  it('lists groups with mailto links and maps edit fields before refetching', async () => {
    const user = userEvent.setup()
    hookState.groups = [group]
    render(<GoogleGroups />)

    expect(screen.getByRole('link', { name: 'backend@mentorbridge.in' })).toHaveAttribute(
      'href',
      'mailto:backend@mentorbridge.in',
    )

    await user.click(screen.getByRole('button', { name: 'Add group' }))
    expect(screen.getByText('form-mode:create')).toBeInTheDocument()

    await user.click(rowButtons('Backend cohort')[0])
    expect(screen.getByText('form-mode:grp-1')).toBeInTheDocument()
    expect(screen.getByText('form-name:Backend cohort')).toBeInTheDocument()
    expect(screen.getByText('form-email:backend@mentorbridge.in')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Complete save' }))
    expect(hookState.refetch).toHaveBeenCalled()
    expect(screen.queryByText('form-mode:grp-1')).not.toBeInTheDocument()
  })

  it('opens delete with the selected group and refetches after confirm', async () => {
    const user = userEvent.setup()
    hookState.groups = [group]
    render(<GoogleGroups />)

    await user.click(rowButtons('Backend cohort')[1])
    expect(screen.getByText('delete:backend@mentorbridge.in')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(hookState.refetch).toHaveBeenCalled()
    expect(screen.queryByText('delete:backend@mentorbridge.in')).not.toBeInTheDocument()
  })
})
