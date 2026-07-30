import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { PresenterFormState } from './Presenter.types'
import { PresenterFormDrawer } from './PresenterFormDrawer'

interface ChildrenProps {
  children: ReactNode
}

interface CalendarMockProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

interface UserSearchMockProps {
  onSelect: (student: { email: string }) => void
}

const presenterMutations = vi.hoisted(() => ({
  createPresenter: vi.fn(),
  updatePresenter: vi.fn(),
}))

vi.mock('@/hooks/usePresenters', () => ({
  usePresenters: () => ({
    createPresenter: presenterMutations.createPresenter,
    updatePresenter: presenterMutations.updatePresenter,
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
  }: ChildrenProps & {
    isOpen: boolean
  }) => (isOpen ? <div role="dialog">{children}</div> : null)

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: ({ children }: ChildrenProps) => <h2>{children}</h2>,
      Body: ({ children }: ChildrenProps) => <section>{children}</section>,
      Footer: ({ children }: ChildrenProps) => <footer>{children}</footer>,
    }),
  }
})

vi.mock('@/molecules/calendar', () => ({
  CalendarInput: ({
    id,
    label,
    value,
    onChange,
  }: CalendarMockProps) => (
    <label htmlFor={id}>
      {label}
      <input id={id} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  ),
}))

vi.mock('@/molecules/user-search/UserSearch', () => ({
  UserSearch: ({
    onSelect,
  }: UserSearchMockProps) => (
    <button
      type="button"
      onClick={() => onSelect({ email: 'updated-presenter@example.com' })}
    >
      Pick presenter
    </button>
  ),
}))

const firstPresenter: PresenterFormState = {
  id: 'presenter-1',
  presentedBy: 'student-one@example.com',
  presentedDate: '2026-06-01T12:00:00.000Z',
  topic: 'Original topic',
}

const secondPresenter: PresenterFormState = {
  id: 'presenter-2',
  presentedBy: 'student-two@example.com',
  presentedDate: '2026-06-02T12:00:00.000Z',
  topic: 'Second presenter topic',
}

const noop = () => {}

function renderDrawer(presenterToEdit: PresenterFormState) {
  return (
    <PresenterFormDrawer
      isOpen
      presenterToEdit={presenterToEdit}
      onClose={noop}
      onSuccess={noop}
    />
  )
}

describe('PresenterFormDrawer', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('keeps dirty edits when the same presenter rerenders with a new object reference', async () => {
    const user = userEvent.setup()
    const { rerender } = render(renderDrawer(firstPresenter))

    const topicInput = screen.getByPlaceholderText('Presentation topic...')
    await user.clear(topicInput)
    await user.type(topicInput, 'Edited before parent rerender')

    rerender(renderDrawer({ ...firstPresenter }))

    expect(screen.getByPlaceholderText('Presentation topic...')).toHaveValue(
      'Edited before parent rerender',
    )
  })

  it('resets form values when editing switches to a different presenter', () => {
    const { rerender } = render(renderDrawer(firstPresenter))

    rerender(renderDrawer(secondPresenter))

    expect(screen.getByPlaceholderText('Presentation topic...')).toHaveValue(
      secondPresenter.topic,
    )
    expect(
      screen.getByText(`Presenter: ${secondPresenter.presentedBy}`),
    ).toBeInTheDocument()
  })
})
