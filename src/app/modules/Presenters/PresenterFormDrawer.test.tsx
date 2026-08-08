import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PresenterFormDrawer } from './PresenterFormDrawer'
import type { PresenterFormState } from './Presenter.types'

const { createPresenterMock, updatePresenterMock } = vi.hoisted(() => ({
  createPresenterMock: vi.fn(),
  updatePresenterMock: vi.fn(),
}))

vi.mock('@/hooks/usePresenters', () => ({
  usePresenters: () => ({
    createPresenter: createPresenterMock,
    updatePresenter: updatePresenterMock,
  }),
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
      Body: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Footer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    }),
  }
})

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    label,
    value,
    onChange,
  }: {
    label: string
    value: string
    onChange: (value: string) => void
  }) => (
    <input
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}))

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: ({
    onSelect,
  }: {
    onSelect: (student: { email: string }) => void
  }) => (
    <button
      type="button"
      onClick={() => onSelect({ email: 'selected@example.com' })}
    >
      Select student
    </button>
  ),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const presenterOne: PresenterFormState = {
  id: 'presenter-1',
  presentedBy: 'ada@example.com',
  presentedDate: '2026-06-01T12:00:00.000Z',
  topic: 'Initial topic',
}

const presenterTwo: PresenterFormState = {
  id: 'presenter-2',
  presentedBy: 'grace@example.com',
  presentedDate: '2026-06-02T12:00:00.000Z',
  topic: 'Second presenter topic',
}

function renderDrawer(presenterToEdit: PresenterFormState) {
  return render(
    <PresenterFormDrawer
      isOpen
      presenterToEdit={presenterToEdit}
      onClose={vi.fn()}
      onSuccess={vi.fn()}
    />,
  )
}

describe('PresenterFormDrawer', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('does not reset unsaved edits when the same presenter row is refreshed', async () => {
    const user = userEvent.setup()
    const { rerender } = renderDrawer(presenterOne)

    const topicInput = await screen.findByDisplayValue('Initial topic')
    await user.clear(topicInput)
    await user.type(topicInput, 'Unsaved topic')

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={{ ...presenterOne, topic: 'Refetched topic' }}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    expect(screen.getByDisplayValue('Unsaved topic')).toBeInTheDocument()
    expect(screen.queryByDisplayValue('Refetched topic')).not.toBeInTheDocument()
  })

  it('resets form values when switching to a different presenter', async () => {
    const { rerender } = renderDrawer(presenterOne)

    await screen.findByDisplayValue('Initial topic')

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={presenterTwo}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await waitFor(() =>
      expect(screen.getByDisplayValue('Second presenter topic')).toBeInTheDocument(),
    )
  })
})
