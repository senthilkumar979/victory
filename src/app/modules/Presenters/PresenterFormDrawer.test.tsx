import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { PresenterFormState } from './Presenter.types'
import { PresenterFormDrawer } from './PresenterFormDrawer'

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

vi.mock('goey-toast', () => ({
  gooeyToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <div>{children}</div> : null)

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
      Body: ({ children }: { children: ReactNode }) => <div>{children}</div>,
      Footer: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
      ),
    }),
  }
})

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    id,
    label,
    value,
    onChange,
  }: {
    id?: string
    label?: ReactNode
    value: string
    onChange: (value: string) => void
  }) => (
    <label>
      {label}
      <input
        id={id}
        aria-label={typeof label === 'string' ? label : 'Presentation date'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
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
      Select presenter
    </button>
  ),
}))

function makePresenter(
  overrides: Partial<PresenterFormState> = {},
): PresenterFormState {
  return {
    id: 'presenter-1',
    presentedBy: 'ada@example.com',
    presentedDate: '2026-06-01T12:00:00.000Z',
    topic: 'Original topic',
    ...overrides,
  }
}

describe('PresenterFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createPresenterMock.mockResolvedValue({ id: 'new-presenter' })
    updatePresenterMock.mockResolvedValue(undefined)
  })

  it('preserves typed edits when the same presenter row is rerendered', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    const firstPresenter = makePresenter()
    const { rerender } = render(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={firstPresenter}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    )

    const topicInput = await screen.findByPlaceholderText(
      'Presentation topic...',
    )
    await waitFor(() => expect(topicInput).toHaveValue('Original topic'))

    await user.clear(topicInput)
    await user.type(topicInput, 'Typed before parent refresh')

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={{
          ...firstPresenter,
          topic: 'Stale server topic',
        }}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    )

    expect(topicInput).toHaveValue('Typed before parent refresh')

    const nextPresenter = makePresenter({
      id: 'presenter-2',
      topic: 'Next presenter topic',
    })
    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={nextPresenter}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    )

    await waitFor(() => expect(topicInput).toHaveValue('Next presenter topic'))
    await user.click(screen.getByRole('button', { name: /update/i }))

    expect(updatePresenterMock).toHaveBeenCalledWith('presenter-2', {
      presentedBy: 'ada@example.com',
      presentedDate: '2026-06-01T12:00:00.000Z',
      topic: 'Next presenter topic',
    })
    expect(createPresenterMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
