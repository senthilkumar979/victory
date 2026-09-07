import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HallOfFameFormDrawer } from './HallOfFameFormDrawer'

const { createEntryMock, successToastMock, errorToastMock } = vi.hoisted(() => ({
  createEntryMock: vi.fn(),
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('@/hooks/useHallOfFame', () => ({
  useHallOfFame: () => ({
    createEntry: createEntryMock,
  }),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: errorToastMock },
}))
vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const Root = ({ isOpen, children }: { isOpen: boolean; children: ReactNode }) =>
    isOpen ? <section>{children}</section> : null
  const Slot = ({ children }: { children: ReactNode }) => <>{children}</>
  return { Drawer: Object.assign(Root, { Title: Slot, Body: Slot, Footer: Slot }) }
})

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: ({
    onSelect,
  }: {
    onSelect: (student: { email: string; name: string }) => void
  }) => (
    <button
      type="button"
      onClick={() =>
        onSelect({ email: '  ada@example.com  ', name: 'Ada Lovelace' })
      }
    >
      Pick student
    </button>
  ),
}))

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    value,
    onChange,
  }: {
    value: string
    onChange: (dateString: string) => void
  }) => (
    <input
      aria-label="Date of induction"
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

afterEach(() => {
  cleanup()
})

describe('HallOfFameFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createEntryMock.mockResolvedValue(undefined)
  })

  it('trims email and induction date before create', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <HallOfFameFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Pick student' }))
    await user.type(
      screen.getByLabelText('Date of induction'),
      '  2026-06-01T12:00:00.000Z  ',
    )
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => expect(createEntryMock).toHaveBeenCalledTimes(1))
    expect(createEntryMock).toHaveBeenCalledWith({
      student_email: 'ada@example.com',
      date_of_induction: '2026-06-01T12:00:00.000Z',
    })
    expect(onSuccess).toHaveBeenCalledTimes(1)
    expect(successToastMock).toHaveBeenCalledTimes(1)
  })

  it('toasts create failures and skips onSuccess', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    createEntryMock.mockRejectedValueOnce(new Error('duplicate email'))

    render(
      <HallOfFameFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Pick student' }))
    await user.type(
      screen.getByLabelText('Date of induction'),
      '2026-06-01T12:00:00.000Z',
    )
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => expect(errorToastMock).toHaveBeenCalledTimes(1))
    expect(errorToastMock).toHaveBeenCalledWith(
      'Failed to add entry.',
      expect.objectContaining({ description: 'duplicate email' }),
    )
    expect(onSuccess).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()
  })
})
