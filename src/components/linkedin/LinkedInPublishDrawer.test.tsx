import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { gooeyToast } from 'goey-toast'

import { LinkedInPublishDrawer } from './LinkedInPublishDrawer'

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

vi.mock('./LinkedInFeedPreview', () => ({
  LinkedInFeedPreview: ({ commentary }: { commentary: string }) => (
    <p>preview:{commentary}</p>
  ),
}))

const draftState = {
  commentary: 'Ship the recap',
  setCommentary: vi.fn(),
  isGenerating: false,
  isPublishing: false,
  publish: vi.fn(),
  generateError: null as string | null,
}

vi.mock('./useLinkedInPostDraft', () => ({
  useLinkedInPostDraft: () => draftState,
}))

const drawerProps = {
  isOpen: true,
  onClose: vi.fn(),
  onPublished: vi.fn(),
  contextTitle: 'Weekly sync',
  contextDescription: 'Agenda',
  primaryLink: 'https://mentorbridge.in/events/1',
  coverImageUrl: 'https://cdn.example/cover.png',
  companyDisplayName: 'MentorBridge',
}

function renderDrawer(
  overrides: Partial<ComponentProps<typeof LinkedInPublishDrawer>> = {},
) {
  const props = { ...drawerProps, ...overrides }
  render(<LinkedInPublishDrawer {...props} />)
  return props
}

beforeEach(() => {
  draftState.commentary = 'Ship the recap'
  draftState.isGenerating = false
  draftState.isPublishing = false
  draftState.generateError = null
  draftState.publish.mockReset()
  drawerProps.onClose.mockReset()
  drawerProps.onPublished.mockReset()
  vi.mocked(gooeyToast.success).mockReset()
})

afterEach(() => {
  cleanup()
})

describe('LinkedInPublishDrawer', () => {
  it('disables publish when commentary is whitespace-only', () => {
    draftState.commentary = '   '
    renderDrawer()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
  })

  it('disables the editor and publish while generating', () => {
    draftState.isGenerating = true
    renderDrawer()

    expect(screen.getByLabelText('Post text')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()
    expect(screen.queryByText('preview:Ship the recap')).not.toBeInTheDocument()
  })

  it('shows generate errors from the draft hook', () => {
    draftState.generateError = 'Failed to generate post'
    renderDrawer()
    expect(screen.getByText('Failed to generate post')).toBeInTheDocument()
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
        coverImageUrl: 'https://cdn.example/cover.png',
        imageAltText: 'Weekly sync',
      }),
    )
    expect(gooeyToast.success).toHaveBeenCalledWith(
      'Published to LinkedIn.',
      expect.objectContaining({ description: 'Weekly sync' }),
    )
    expect(props.onPublished).toHaveBeenCalled()
    expect(props.onClose).toHaveBeenCalled()
  })
})
