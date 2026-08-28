import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AwardFormDrawer } from './AwardFormDrawer'
import type { AwardFormState } from './Award.types'

const {
  createAwardMock,
  updateAwardMock,
  sendEmailMock,
  successToastMock,
  errorToastMock,
} = vi.hoisted(() => ({
  createAwardMock: vi.fn(),
  updateAwardMock: vi.fn(),
  sendEmailMock: vi.fn(),
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('@/hooks/useAwards', () => ({
  useAwards: () => ({
    createAward: createAwardMock,
    updateAward: updateAwardMock,
  }),
}))

vi.mock('@/hooks/useAwardCategories', () => ({
  useAwardCategories: () => ({
    categories: [{ id: 'cat-1', name: 'Outstanding Contributor' }],
    isLoading: false,
    error: null,
  }),
}))

vi.mock('./sendAwardWinnerNotificationEmail', () => ({
  sendAwardWinnerNotificationEmail: (...args: unknown[]) =>
    sendEmailMock(...args),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToastMock,
    error: errorToastMock,
  },
}))

interface DrawerRootProps {
  isOpen: boolean
  children: ReactNode
}

interface DrawerSlotProps {
  children: ReactNode
}

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({ isOpen, children }: DrawerRootProps) =>
    isOpen ? <section>{children}</section> : null
  const DrawerSlot = ({ children }: DrawerSlotProps) => <>{children}</>

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: DrawerSlot,
      Body: DrawerSlot,
      Footer: DrawerSlot,
    }),
  }
})

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (dateString: string) => void
  }) => (
    <input
      aria-label="Awarded on"
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: ({
    onSelect,
  }: {
    onSelect: (student: { email: string; name: string }) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({ email: 'ada@example.com', name: 'Ada Lovelace' })
      }
    >
      Pick student
    </button>
  ),
}))

function makeAward(overrides: Partial<AwardFormState> = {}): AwardFormState {
  return {
    id: 'award-1',
    awardedTo: 'ada@example.com',
    awardedOn: '2026-06-01T12:00:00.000Z',
    description: 'Outstanding contributor',
    awardCategoryId: 'cat-1',
    student: { name: 'Ada Lovelace', picture: '', batch: '1' },
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('AwardFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createAwardMock.mockResolvedValue({ id: 'award-new' })
    updateAwardMock.mockResolvedValue(undefined)
    sendEmailMock.mockResolvedValue(undefined)
  })

  it('still saves a new award when the winner email fails', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    sendEmailMock.mockRejectedValueOnce(new Error('mailbox down'))

    render(
      <AwardFormDrawer
        isOpen
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Pick student' }))
    await user.type(screen.getByLabelText('Awarded on'), '2026-06-01T12:00:00.000Z')
    await user.type(
      screen.getByPlaceholderText('Award description...'),
      'Outstanding contributor',
    )
    await user.selectOptions(
      screen.getByLabelText(/Award category/),
      'cat-1',
    )
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(createAwardMock).toHaveBeenCalledTimes(1))
    expect(sendEmailMock).toHaveBeenCalledWith({
      recipientEmail: 'ada@example.com',
      awardWinnerDisplayName: 'Ada Lovelace',
      awardCategoryName: 'Outstanding Contributor',
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(errorToastMock).not.toHaveBeenCalled()
  })

  it('does not send a winner email when updating an existing award', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <AwardFormDrawer
        isOpen
        awardToEdit={makeAward()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await waitFor(() =>
      expect(screen.getByPlaceholderText('Award description...')).toHaveValue(
        'Outstanding contributor',
      ),
    )

    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => expect(updateAwardMock).toHaveBeenCalledTimes(1))
    expect(createAwardMock).not.toHaveBeenCalled()
    expect(sendEmailMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
