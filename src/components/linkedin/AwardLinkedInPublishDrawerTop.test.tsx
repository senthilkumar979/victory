import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AwardLinkedInPublishDrawerTop } from './AwardLinkedInPublishDrawerTop'

const baseProps = {
  studentName: 'Ada Lovelace',
  categoryLabel: 'Backend',
  coverUrl: null as string | null,
  isBootstrapping: false,
  isGeneratingCover: false,
  isGeneratingPost: false,
  isBusy: false,
  onRegenerateCover: vi.fn(),
  onRegeneratePost: vi.fn(),
}

describe('AwardLinkedInPublishDrawerTop', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('shows a cover ahead of the bootstrap spinner', () => {
    const { container, rerender } = render(
      <AwardLinkedInPublishDrawerTop
        {...baseProps}
        coverUrl="https://cdn.example/cover.png"
        isBootstrapping
      />,
    )

    expect(container.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example/cover.png',
    )
    expect(container.querySelector('.min-h-\\[160px\\]')).not.toBeInTheDocument()

    rerender(
      <AwardLinkedInPublishDrawerTop {...baseProps} coverUrl="" isBootstrapping />,
    )

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.min-h-\\[160px\\]')).toBeInTheDocument()

    rerender(<AwardLinkedInPublishDrawerTop {...baseProps} coverUrl={null} />)

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(container.querySelector('.min-h-\\[160px\\]')).not.toBeInTheDocument()
  })

  it('blocks regenerate actions while a request is in flight', async () => {
    const user = userEvent.setup()
    const onRegenerateCover = vi.fn()
    const onRegeneratePost = vi.fn()

    const { rerender } = render(
      <AwardLinkedInPublishDrawerTop
        {...baseProps}
        isBusy
        onRegenerateCover={onRegenerateCover}
        onRegeneratePost={onRegeneratePost}
      />,
    )

    expect(screen.getByRole('button', { name: /Regenerate cover/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Regenerate post/ })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: /Regenerate cover/ }))
    await user.click(screen.getByRole('button', { name: /Regenerate post/ }))
    expect(onRegenerateCover).not.toHaveBeenCalled()
    expect(onRegeneratePost).not.toHaveBeenCalled()

    rerender(
      <AwardLinkedInPublishDrawerTop
        {...baseProps}
        isBusy={false}
        onRegenerateCover={onRegenerateCover}
        onRegeneratePost={onRegeneratePost}
      />,
    )

    await user.click(screen.getByRole('button', { name: /Regenerate cover/ }))
    await user.click(screen.getByRole('button', { name: /Regenerate post/ }))
    expect(onRegenerateCover).toHaveBeenCalledTimes(1)
    expect(onRegeneratePost).toHaveBeenCalledTimes(1)
  })
})
