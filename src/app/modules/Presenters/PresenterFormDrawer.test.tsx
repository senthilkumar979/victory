import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PresenterFormState } from './Presenter.types'
import { PresenterFormDrawer } from './PresenterFormDrawer'
import type { PresenterFormValues } from './presenterFormSchema'

const { usePresentersMock } = vi.hoisted(() => ({
  usePresentersMock: vi.fn(),
}))

vi.mock('@/hooks/usePresenters', () => ({
  usePresenters: usePresentersMock,
}))

vi.mock('goey-toast', () => ({
  gooeyToast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

vi.mock('lucide-react', () => ({
  Check: () => null,
  XIcon: () => null,
}))

vi.mock('@/atoms/button/Button', () => ({
  Button: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const Drawer = ({
    children,
    isOpen,
  }: {
    children: ReactNode
    isOpen: boolean
  }) => (isOpen ? <section>{children}</section> : null)
  Drawer.Title = ({ children }: { children: ReactNode }) => <h2>{children}</h2>
  Drawer.Body = ({ children }: { children: ReactNode }) => <div>{children}</div>
  Drawer.Footer = ({ children }: { children: ReactNode }) => (
    <footer>{children}</footer>
  )
  return { Drawer }
})

vi.mock('./PresenterFormFields', () => ({
  PresenterFormFields: ({
    form,
  }: {
    form: UseFormReturn<PresenterFormValues>
  }) => <input aria-label="Topic" {...form.register('topic')} />,
}))

function makePresenter(overrides: Partial<PresenterFormState> = {}): PresenterFormState {
  return {
    id: 'presenter-1',
    presentedBy: 'presenter@example.com',
    presentedDate: '2026-06-01T12:00:00.000Z',
    topic: 'Original topic',
    ...overrides,
  }
}

describe('PresenterFormDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    usePresentersMock.mockReturnValue({
      createPresenter: vi.fn(),
      updatePresenter: vi.fn(),
    })
  })

  afterEach(() => cleanup())

  it('keeps edits when the same presenter row gets a new object reference', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onSuccess = vi.fn()
    const originalPresenter = makePresenter()

    const { rerender } = render(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={originalPresenter}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    )

    const topicInput = screen.getByRole('textbox', { name: 'Topic' })
    expect(topicInput).toHaveValue('Original topic')

    await user.clear(topicInput)
    await user.type(topicInput, 'Draft topic')

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={makePresenter({ topic: 'Server refreshed topic' })}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    )

    expect(screen.getByRole('textbox', { name: 'Topic' })).toHaveValue(
      'Draft topic',
    )

    rerender(
      <PresenterFormDrawer
        isOpen
        presenterToEdit={makePresenter({
          id: 'presenter-2',
          topic: 'Different presenter topic',
        })}
        onClose={onClose}
        onSuccess={onSuccess}
      />,
    )

    await waitFor(() =>
      expect(screen.getByRole('textbox', { name: 'Topic' })).toHaveValue(
        'Different presenter topic',
      ),
    )
  })
})
