import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'
import { gooeyToast } from 'goey-toast'

import { AwardLinkedInPublishDrawer } from './AwardLinkedInPublishDrawer'

vi.mock('goey-toast', () => ({
  gooeyToast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  function DrawerRoot({
    children,
    isOpen,
  }: {
    children: ReactNode
    isOpen: boolean
  }) {
    if (!isOpen) return null
    return <section>{children}</section>
  }
  function Title({
    children,
    description,
  }: {
    children: ReactNode
    description?: string
  }) {
    return (
      <header>
        <h2>{children}</h2>
        {description ? <p>{description}</p> : null}
      </header>
    )
  }
  function Body({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  function Footer({ children }: { children: ReactNode }) {
    return <footer>{children}</footer>
  }
  DrawerRoot.Title = Title
  DrawerRoot.Body = Body
  DrawerRoot.Footer = Footer
  return { Drawer: DrawerRoot }
})

vi.mock('./AwardLinkedInPublishDrawerBody', () => ({
  AwardLinkedInPublishDrawerBody: ({
    studentName,
    categoryLabel,
  }: {
    studentName: string
    categoryLabel: string
  }) => (
    <div>
      <p>student:{studentName}</p>
      <p>category:{categoryLabel}</p>
    </div>
  ),
}))

const draftState = {
  coverPrompt: 'prompt',
  setCoverPrompt: vi.fn(),
  coverUrl: 'https://cdn.example/cover.png' as string | null,
  commentary: 'Celebrating Ada',
  setCommentary: vi.fn(),
  isBootstrapping: false,
  isGeneratingCover: false,
  isGeneratingPost: false,
  isBusy: false,
  generateError: null as string | null,
  regenerateCover: vi.fn(),
  regeneratePost: vi.fn(),
  isPublishing: false,
  publish: vi.fn(),
}

vi.mock('./useAwardLinkedInPublish', () => ({
  useAwardLinkedInPublish: () => draftState,
}))

const award: AwardFormState = {
  id: 'award-1',
  awardedTo: 'ada@mentorbridge.in',
  awardedOn: '2026-03-15',
  description: 'Citation',
  awardCategoryId: 'cat-1',
  student: { name: '  ', picture: '', batch: 12 },
}

function renderDrawer(
  overrides: Partial<ComponentProps<typeof AwardLinkedInPublishDrawer>> = {},
) {
  const props = {
    award,
    categoryName: 'Impact',
    isOpen: true,
    onClose: vi.fn(),
    onPublished: vi.fn(),
    companyDisplayName: 'MentorBridge',
    ...overrides,
  }
  render(<AwardLinkedInPublishDrawer {...props} />)
  return props
}

beforeEach(() => {
  draftState.coverUrl = 'https://cdn.example/cover.png'
  draftState.commentary = 'Celebrating Ada'
  draftState.isBusy = false
  draftState.publish.mockReset()
  vi.mocked(gooeyToast.success).mockReset()
})

afterEach(() => {
  cleanup()
})

describe('AwardLinkedInPublishDrawer', () => {
  it('renders nothing when the award has no id', () => {
    renderDrawer({ award: { ...award, id: undefined } })
    expect(
      screen.queryByText('Publish award to LinkedIn'),
    ).not.toBeInTheDocument()
  })

  it('falls back to awardedTo when student name is whitespace and category dash when empty', () => {
    renderDrawer({ categoryName: '' })

    expect(screen.getByText('student:ada@mentorbridge.in')).toBeInTheDocument()
    expect(screen.getByText('category:—')).toBeInTheDocument()
  })

  it('disables publish when commentary is whitespace-only', () => {
    draftState.commentary = '   '
    renderDrawer()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('disables publish when cover image is missing', () => {
    draftState.coverUrl = null
    renderDrawer()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('toasts, notifies, and closes after a successful publish', async () => {
    const user = userEvent.setup()
    draftState.publish.mockImplementation(
      async ({ onSuccess }: { onSuccess: () => void }) => {
        onSuccess()
      },
    )
    const props = renderDrawer()

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(draftState.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        imageAltText: 'ada@mentorbridge.in — Impact',
      }),
    )
    expect(gooeyToast.success).toHaveBeenCalledWith(
      'Published to LinkedIn.',
      expect.objectContaining({
        description: 'ada@mentorbridge.in — Impact',
      }),
    )
    expect(props.onPublished).toHaveBeenCalled()
    expect(props.onClose).toHaveBeenCalled()
  })

  it('uses Student and Award in the alt text when both names are empty', async () => {
    const user = userEvent.setup()
    draftState.publish.mockImplementation(
      async ({ onSuccess }: { onSuccess: () => void }) => {
        onSuccess()
      },
    )
    renderDrawer({
      award: { ...award, awardedTo: '', student: undefined },
      categoryName: '',
    })

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(draftState.publish).toHaveBeenCalledWith(
      expect.objectContaining({ imageAltText: 'Student — Award' }),
    )
  })
})
