import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PresenterFormDrawer } from './PresenterFormDrawer'
import type { PresenterFormState } from './Presenter.types'

const { updatePresenterMock, successToastMock } = vi.hoisted(() => ({
  updatePresenterMock: vi.fn(),
  successToastMock: vi.fn(),
}))

vi.mock('@/hooks/usePresenters', () => ({
  usePresenters: () => ({
    createPresenter: vi.fn(),
    updatePresenter: updatePresenterMock,
  }),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: successToastMock,
    error: vi.fn(),
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

interface CalendarInputProps {
  value: string
  onChange: (dateString: string) => void
}

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({ value, onChange }: CalendarInputProps) => (
    <input
      aria-label="Presentation date"
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: () => null,
}))

function makePresenter(
  overrides: Partial<PresenterFormState> = {},
): PresenterFormState {
  return {
    id: 'presenter-1',
    presentedBy: 'ada@example.com',
    presentedDate: '2026-06-01T12:00:00.000Z',
    topic: 'Initial topic',
    ...overrides,
  }
}

function drawer(
  presenterToEdit: PresenterFormState | undefined,
  onSuccess = vi.fn(),
) {
  return (
    <PresenterFormDrawer
      isOpen
      presenterToEdit={presenterToEdit}
      onClose={vi.fn()}
      onSuccess={onSuccess}
    />
  )
}

describe('PresenterFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updatePresenterMock.mockResolvedValue(undefined)
  })

  it('preserves same-row edits but resets when switching presenter rows', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const presenter = makePresenter()
    const secondPresenter = makePresenter({
      id: 'presenter-2',
      presentedBy: 'grace@example.com',
      topic: 'Second topic',
    })
    const { rerender } = render(drawer(presenter, onSuccess))

    const topicInput = screen.getByPlaceholderText('Presentation topic...')
    await waitFor(() => expect(topicInput).toHaveValue('Initial topic'))

    await user.clear(topicInput)
    await user.type(topicInput, ' Draft topic ')

    rerender(drawer({ ...presenter, topic: 'Stale server topic' }, onSuccess))

    expect(topicInput).toHaveValue(' Draft topic ')

    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() =>
      expect(updatePresenterMock).toHaveBeenCalledWith('presenter-1', {
        presentedBy: 'ada@example.com',
        presentedDate: '2026-06-01T12:00:00.000Z',
        topic: 'Draft topic',
      }),
    )
    expect(successToastMock).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(1)

    rerender(drawer(secondPresenter))

    await waitFor(() => expect(topicInput).toHaveValue('Second topic'))
    expect(screen.getByText('Presenter: grace@example.com')).toBeInTheDocument()
  })
})
