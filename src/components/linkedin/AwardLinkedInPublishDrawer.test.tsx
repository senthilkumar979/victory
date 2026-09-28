import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from '@/app/modules/Awards/Award.types'

import { AwardLinkedInPublishDrawer } from './AwardLinkedInPublishDrawer'

const { draftState, publishMock, toastSuccess } = vi.hoisted(() => ({
  draftState: {
    commentary: 'Congrats Ada',
    coverUrl: 'https://cdn.example/cover.png' as string | null,
    isBusy: false,
    isPublishing: false,
    isBootstrapping: false,
    isGeneratingCover: false,
    isGeneratingPost: false,
    coverPrompt: 'prompt',
    generateError: null as string | null,
    setCoverPrompt: vi.fn(),
    setCommentary: vi.fn(),
    regenerateCover: vi.fn(),
    regeneratePost: vi.fn(),
  },
  publishMock: vi.fn(),
  toastSuccess: vi.fn(),
}))

vi.mock('./useAwardLinkedInPublish', () => ({
  useAwardLinkedInPublish: () => ({
    ...draftState,
    publish: publishMock,
  }),
}))

vi.mock('goey-toast', () => ({
  gooeyToast: { success: toastSuccess, error: vi.fn() },
}))

vi.mock('./AwardLinkedInPublishDrawerBody', () => ({
  AwardLinkedInPublishDrawerBody: function AwardLinkedInPublishDrawerBody({
    studentName,
    categoryLabel,
    primaryLink,
  }: {
    studentName: string
    categoryLabel: string
    primaryLink: string
  }) {
    return (
      <div
        data-testid="award-linkedin-body"
        data-student={studentName}
        data-category={categoryLabel}
        data-link={primaryLink}
      />
    )
  },
}))

vi.mock('@/ui/organisms/drawer/Drawer', () => {
  function DrawerRoot({ children }: { children: ReactNode }) {
    return <section>{children}</section>
  }
  function DrawerTitle({ children }: { children: ReactNode }) {
    return <h2>{children}</h2>
  }
  function DrawerBody({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  function DrawerFooter({ children }: { children: ReactNode }) {
    return <div>{children}</div>
  }
  return {
    Drawer: Object.assign(DrawerRoot, {
      Title: DrawerTitle,
      Body: DrawerBody,
      Footer: DrawerFooter,
    }),
  }
})

const award: AwardFormState = {
  id: 'award-1',
  awardedTo: 'ada@mentorbridge.in',
  awardedOn: '2026-07-01',
  description: 'Parser award',
  awardCategoryId: 'cat-1',
  student: { name: '  Ada Lovelace  ', picture: '', batch: '12' },
}

function renderDrawer(
  overrides?: Partial<{
    award: AwardFormState | null
    categoryName: string
  }>,
) {
  return render(
    <AwardLinkedInPublishDrawer
      award={overrides && 'award' in overrides ? overrides.award! : award}
      categoryName={overrides?.categoryName ?? 'Backend'}
      isOpen
      onClose={vi.fn()}
      onPublished={vi.fn()}
      companyDisplayName="MentorBridge"
    />,
  )
}

beforeEach(() => {
  draftState.commentary = 'Congrats Ada'
  draftState.coverUrl = 'https://cdn.example/cover.png'
  draftState.isBusy = false
  publishMock.mockReset()
  toastSuccess.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('AwardLinkedInPublishDrawer', () => {
  it('renders nothing without an award id', () => {
    renderDrawer({ award: { ...award, id: undefined } })
    expect(screen.queryByRole('heading', { name: 'Publish award to LinkedIn' })).not.toBeInTheDocument()
  })

  it('trims the student name and falls back only when it is empty', () => {
    const { rerender } = renderDrawer()
    expect(screen.getByTestId('award-linkedin-body')).toHaveAttribute(
      'data-student',
      'Ada Lovelace',
    )

    rerender(
      <AwardLinkedInPublishDrawer
        award={{ ...award, student: { name: '   ', picture: '', batch: 1 } }}
        categoryName=""
        isOpen
        onClose={vi.fn()}
        onPublished={vi.fn()}
        companyDisplayName="MentorBridge"
      />,
    )
    const body = screen.getByTestId('award-linkedin-body')
    expect(body).toHaveAttribute('data-student', 'ada@mentorbridge.in')
    expect(body).toHaveAttribute('data-category', '—')
    expect(body.getAttribute('data-link')).toMatch(/\/hall-of-fame$/)

    rerender(
      <AwardLinkedInPublishDrawer
        award={{ ...award, student: undefined, awardedTo: '' }}
        categoryName="Backend"
        isOpen
        onClose={vi.fn()}
        onPublished={vi.fn()}
        companyDisplayName="MentorBridge"
      />,
    )
    expect(screen.getByTestId('award-linkedin-body')).toHaveAttribute(
      'data-student',
      'Student',
    )
  })

  it('does not publish without commentary and a cover, then publishes with the image alt', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onPublished = vi.fn()
    draftState.commentary = '   '
    draftState.coverUrl = null

    const { rerender } = render(
      <AwardLinkedInPublishDrawer
        award={award}
        categoryName=""
        isOpen
        onClose={onClose}
        onPublished={onPublished}
        companyDisplayName="MentorBridge"
      />,
    )

    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()

    draftState.commentary = 'Congrats Ada'
    draftState.coverUrl = 'https://cdn.example/cover.png'
    draftState.isBusy = true
    rerender(
      <AwardLinkedInPublishDrawer
        award={award}
        categoryName=""
        isOpen
        onClose={onClose}
        onPublished={onPublished}
        companyDisplayName="MentorBridge"
      />,
    )
    expect(screen.getByRole('button', { name: 'Publish' })).toBeDisabled()

    draftState.isBusy = false
    publishMock.mockImplementation(async ({ onSuccess }: { onSuccess?: () => void }) => {
      onSuccess?.()
    })
    rerender(
      <AwardLinkedInPublishDrawer
        award={award}
        categoryName=""
        isOpen
        onClose={onClose}
        onPublished={onPublished}
        companyDisplayName="MentorBridge"
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Publish' }))

    expect(publishMock).toHaveBeenCalledWith(
      expect.objectContaining({ imageAltText: 'Ada Lovelace — Award' }),
    )
    expect(toastSuccess).toHaveBeenCalledWith(
      'Published to LinkedIn.',
      expect.objectContaining({ description: 'Ada Lovelace — Award' }),
    )
    expect(onPublished).toHaveBeenCalledOnce()
    expect(onClose).toHaveBeenCalledOnce()
  })
})
