import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PresenterFormState } from './Presenter.types'

import { PresenterFormDrawer } from './PresenterFormDrawer'

const {
  createPresenterMock,
  errorToastMock,
  successToastMock,
  updatePresenterMock,
} = vi.hoisted(() => ({
  createPresenterMock: vi.fn(),
  errorToastMock: vi.fn(),
  successToastMock: vi.fn(),
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
    error: errorToastMock,
    success: successToastMock,
  },
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    children,
    isOpen,
  }: {
    children: ReactNode
    isOpen: boolean
  }) => (isOpen ? <div role="dialog">{children}</div> : null)

  return {
    Drawer: Object.assign(DrawerRoot, {
      Body: ({ children }: { children: ReactNode }) => (
        <section>{children}</section>
      ),
      Footer: ({ children }: { children: ReactNode }) => (
        <footer>{children}</footer>
      ),
      Title: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    }),
  }
})

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    id,
    label,
    onChange,
    value,
  }: {
    id: string
    label: string
    onChange: (value: string) => void
    value: string
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  ),
}))

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: ({
    onSelect,
    placeholder,
  }: {
    onSelect: (student: { email: string }) => void
    placeholder: string
  }) => (
    <button
      type="button"
      onClick={() => onSelect({ email: 'grace@example.com' })}
    >
      {placeholder}
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
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    createPresenterMock.mockResolvedValue({ id: 'created-presenter' })
    updatePresenterMock.mockResolvedValue(undefined)
  })

  it('does not wipe dirty edits when the same presenter is rerendered', async () => {
    const user = userEvent.setup()
    const initialPresenter = makePresenter()
    const { rerender } = render(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={initialPresenter}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    const topicInput = await screen.findByDisplayValue('Original topic')
    await user.clear(topicInput)
    await user.type(topicInput, 'Unsaved draft')

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={makePresenter({ topic: 'Server rerender topic' })}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    expect(screen.getByDisplayValue('Unsaved draft')).toBeInTheDocument()

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={makePresenter({
          id: 'presenter-2',
          topic: 'Different presenter topic',
        })}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await waitFor(() => {
      expect(
        screen.getByDisplayValue('Different presenter topic'),
      ).toBeInTheDocument()
    })
  })

  it('submits trimmed controlled field values when updating a presenter', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    render(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={makePresenter()}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    await user.click(screen.getByRole('button', { name: /search students/i }))
    await user.clear(screen.getByLabelText('Presentation date'))
    await user.type(screen.getByLabelText('Presentation date'), ' 2026-07-01 ')
    await user.clear(screen.getByLabelText('Topic'))
    await user.type(screen.getByLabelText('Topic'), '  Type-safe forms  ')
    await user.click(screen.getByRole('button', { name: /update/i }))

    await waitFor(() => expect(updatePresenterMock).toHaveBeenCalledTimes(1))
    expect(updatePresenterMock).toHaveBeenCalledWith('presenter-1', {
      presentedBy: 'grace@example.com',
      presentedDate: '2026-07-01',
      topic: 'Type-safe forms',
    })
    expect(createPresenterMock).not.toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })
})
