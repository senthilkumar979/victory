import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import { MeetingCoverImageDrawer } from './MeetingCoverImageDrawer'

const hookState = vi.hoisted(() => ({
  prompt: 'default prompt',
  setPrompt: vi.fn(),
  previewUrl: null as string | null,
  previewPathname: null as string | null,
  isGenerating: false,
  isConfirming: false,
  generate: vi.fn(),
  confirm: vi.fn(),
}))

vi.mock('./useMeetingCoverImage', () => ({
  useMeetingCoverImage: () => hookState,
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  const DrawerRoot = ({
    isOpen,
    children,
  }: {
    isOpen: boolean
    children: ReactNode
  }) => (isOpen ? <section>{children}</section> : null)
  const DrawerSlot = ({ children }: { children: ReactNode }) => <>{children}</>

  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: DrawerSlot,
      Body: DrawerSlot,
      Footer: DrawerSlot,
    }),
  }
})

function makeMeeting(
  overrides: Partial<MeetingFormState> = {},
): MeetingFormState {
  return {
    id: 'mtg-1',
    title: 'Weekly standup',
    date: '2026-06-01T00:00:00+05:30',
    googleGroupId: 'grp-1',
    description: '',
    meetingLink: '',
    coverImageUrl: '',
    ...overrides,
  }
}

afterEach(() => {
  cleanup()
})

describe('MeetingCoverImageDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hookState.prompt = 'default prompt'
    hookState.previewUrl = null
    hookState.previewPathname = null
    hookState.isGenerating = false
    hookState.isConfirming = false
    hookState.generate.mockResolvedValue(undefined)
    hookState.confirm.mockResolvedValue({ ok: false })
  })

  it('renders nothing when the meeting has no id', () => {
    const { container } = render(
      <MeetingCoverImageDrawer
        meeting={makeMeeting({ id: undefined })}
        isOpen
        onClose={vi.fn()}
        onConfirmed={vi.fn()}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('keeps confirm disabled until a preview pathname exists', () => {
    render(
      <MeetingCoverImageDrawer
        meeting={makeMeeting()}
        isOpen
        onClose={vi.fn()}
        onConfirmed={vi.fn()}
      />,
    )

    expect(
      screen.getByRole('button', { name: 'Use as cover image' }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Generate' })).toBeEnabled()
  })

  it('closes only after confirm succeeds', async () => {
    const user = userEvent.setup()
    hookState.previewPathname = 'covers/mtg-1.png'
    hookState.previewUrl = 'https://cdn.test/preview.png'
    hookState.confirm.mockResolvedValueOnce({ ok: true })

    const onClose = vi.fn()
    const onConfirmed = vi.fn()

    render(
      <MeetingCoverImageDrawer
        meeting={makeMeeting()}
        isOpen
        onClose={onClose}
        onConfirmed={onConfirmed}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Use as cover image' }))

    expect(hookState.confirm).toHaveBeenCalledTimes(1)
    expect(onConfirmed).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when confirm fails', async () => {
    const user = userEvent.setup()
    hookState.previewPathname = 'covers/mtg-1.png'
    hookState.previewUrl = 'https://cdn.test/preview.png'
    hookState.confirm.mockResolvedValueOnce({ ok: false })

    const onClose = vi.fn()
    const onConfirmed = vi.fn()

    render(
      <MeetingCoverImageDrawer
        meeting={makeMeeting()}
        isOpen
        onClose={onClose}
        onConfirmed={onConfirmed}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Use as cover image' }))

    expect(hookState.confirm).toHaveBeenCalledTimes(1)
    expect(onConfirmed).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })
})
