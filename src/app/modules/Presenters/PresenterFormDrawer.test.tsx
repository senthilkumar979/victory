import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PresenterFormDrawer } from './PresenterFormDrawer'
import type { PresenterFormState } from './Presenter.types'

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
  gooeyToast: {
    success: successToastMock,
    error: errorToastMock,
  },
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)

  const DrawerTitle = ({
    children,
    description,
  }: {
    children: ReactNode
    description?: ReactNode
  }) => (
    <header>
      <h2>{children}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  )

  const DrawerBody = ({ children }: { children: ReactNode }) => (
    <main>{children}</main>
  )

  const DrawerFooter = ({ children }: { children: ReactNode }) => (
    <footer>{children}</footer>
  )

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: DrawerTitle,
      Body: DrawerBody,
      Footer: DrawerFooter,
    }),
  }
})

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    id,
    label,
    value,
    onChange,
    placeholder,
  }: {
    id?: string
    label?: ReactNode
    value: string
    onChange: (dateString: string) => void
    placeholder?: string
  }) => (
    <label htmlFor={id}>
      {label}
      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  ),
}))

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: () => (
    <input aria-label="Student search" placeholder="Search students by name..." />
  ),
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

describe('PresenterFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updatePresenterMock.mockResolvedValue(undefined)
    createPresenterMock.mockResolvedValue({ id: 'presenter-new' })
  })

  it('preserves dirty edits when the same presenter is rerendered with a fresh object', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const presenter = makePresenter()
    const { rerender } = render(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={presenter}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

    const topicInput = screen.getByPlaceholderText('Presentation topic...')
    await waitFor(() => expect(topicInput).toHaveValue('Initial topic'))

    await user.clear(topicInput)
    await user.type(topicInput, ' Draft topic ')

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={{
          ...presenter,
          topic: 'Stale server topic',
        }}
        onClose={vi.fn()}
        onSuccess={onSuccess}
      />,
    )

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
  })

  it('resets form values when switching to a different presenter row', async () => {
    const user = userEvent.setup()
    const firstPresenter = makePresenter()
    const secondPresenter = makePresenter({
      id: 'presenter-2',
      presentedBy: 'grace@example.com',
      topic: 'Second topic',
    })
    const { rerender } = render(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={firstPresenter}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    const topicInput = screen.getByPlaceholderText('Presentation topic...')
    await waitFor(() => expect(topicInput).toHaveValue('Initial topic'))

    await user.clear(topicInput)
    await user.type(topicInput, 'Unsaved draft')

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={secondPresenter}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />,
    )

    await waitFor(() => expect(topicInput).toHaveValue('Second topic'))
    expect(screen.getByText('Presenter: grace@example.com')).toBeInTheDocument()
  })
})
