import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PresenterFormDrawer } from './PresenterFormDrawer'

const {
  createPresenterMock,
  updatePresenterMock,
  successToastMock,
  errorToastMock,
} = vi.hoisted(() => ({
  createPresenterMock: vi.fn(),
  updatePresenterMock: vi.fn(),
  successToastMock: vi.fn(),
  errorToastMock: vi.fn(),
}))

vi.mock('@/hooks/usePresenters', () => ({
  usePresenters: () => ({
    createPresenter: createPresenterMock,
    updatePresenter: updatePresenterMock,
  }),
}))
vi.mock('goey-toast', () => ({
  gooeyToast: { success: successToastMock, error: errorToastMock },
}))
vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const Root = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)
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
      aria-label="Presentation date"
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

afterEach(() => {
  cleanup()
})

describe('PresenterFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createPresenterMock.mockResolvedValue(undefined)
    updatePresenterMock.mockResolvedValue(undefined)
  })

  it('trims fields and creates a presenter', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <PresenterFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )

    await user.click(screen.getByRole('button', { name: 'Pick student' }))
    await user.type(
      screen.getByLabelText('Presentation date'),
      '  2026-06-15T10:00:00.000Z  ',
    )
    await user.type(
      screen.getByPlaceholderText('Presentation topic...'),
      '  Intro to React  ',
    )
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(createPresenterMock).toHaveBeenCalledWith({
      presentedBy: 'ada@example.com',
      presentedDate: '2026-06-15T10:00:00.000Z',
      topic: 'Intro to React',
    })
    expect(updatePresenterMock).not.toHaveBeenCalled()
    expect(successToastMock).toHaveBeenCalledTimes(1)
  })

  it('updates an existing presenter by id', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={{
          id: 'pre-1',
          presentedBy: 'ada@example.com',
          presentedDate: '2026-06-15T10:00:00.000Z',
          topic: 'Intro to React',
        }}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await waitFor(() =>
      expect(
        screen.getByPlaceholderText('Presentation topic...'),
      ).toHaveValue('Intro to React'),
    )
    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1))
    expect(updatePresenterMock).toHaveBeenCalledWith('pre-1', {
      presentedBy: 'ada@example.com',
      presentedDate: '2026-06-15T10:00:00.000Z',
      topic: 'Intro to React',
    })
    expect(createPresenterMock).not.toHaveBeenCalled()
  })

  it('toasts Error messages and falls back for non-Error rejects', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    createPresenterMock.mockRejectedValueOnce(new Error('Email already used'))

    render(
      <PresenterFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )
    await user.click(screen.getByRole('button', { name: 'Pick student' }))
    await user.type(
      screen.getByLabelText('Presentation date'),
      '2026-06-15T10:00:00.000Z',
    )
    await user.type(
      screen.getByPlaceholderText('Presentation topic...'),
      'Intro to React',
    )
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save presenter.',
        expect.objectContaining({ description: 'Email already used' }),
      ),
    )
    expect(onSuccess).not.toHaveBeenCalled()
    expect(successToastMock).not.toHaveBeenCalled()

    cleanup()
    errorToastMock.mockClear()
    createPresenterMock.mockRejectedValueOnce({ message: 'postgrest' })

    render(
      <PresenterFormDrawer isOpen onClose={vi.fn()} onSuccess={onSuccess} />,
    )
    await user.click(screen.getByRole('button', { name: 'Pick student' }))
    await user.type(
      screen.getByLabelText('Presentation date'),
      '2026-06-15T10:00:00.000Z',
    )
    await user.type(
      screen.getByPlaceholderText('Presentation topic...'),
      'Intro to React',
    )
    await user.click(screen.getByRole('button', { name: /create/i }))

    await waitFor(() =>
      expect(errorToastMock).toHaveBeenCalledWith(
        'Failed to save presenter.',
        expect.objectContaining({ description: 'Please try again.' }),
      ),
    )
    expect(onSuccess).not.toHaveBeenCalled()
  })
})
