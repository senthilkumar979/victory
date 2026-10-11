import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AwardLinkedInPublishDrawerBody } from './AwardLinkedInPublishDrawerBody'

function renderBody(
  overrides: Partial<Parameters<typeof AwardLinkedInPublishDrawerBody>[0]> = {},
) {
  const props = {
    studentName: 'Ada Lovelace',
    categoryLabel: 'Excellence',
    coverPrompt: 'A gold medal',
    onCoverPromptChange: vi.fn(),
    coverUrl: 'https://cdn.example/cover.png',
    commentary: 'Congrats',
    onCommentaryChange: vi.fn(),
    isBootstrapping: false,
    isGeneratingCover: false,
    isGeneratingPost: false,
    isBusy: false,
    generateError: null,
    onRegenerateCover: vi.fn(),
    onRegeneratePost: vi.fn(),
    companyDisplayName: 'MentorBridge',
    primaryLink: 'https://mentorbridge.in/awards/1',
    ...overrides,
  }

  render(<AwardLinkedInPublishDrawerBody {...props} />)
  return props
}

afterEach(() => {
  cleanup()
})

describe('AwardLinkedInPublishDrawerBody', () => {
  it('starts with the prompt and post editors collapsed', () => {
    renderBody()

    expect(screen.getByRole('button', { name: 'Cover image prompt' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Post text' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(document.getElementById('award-cover-prompt-panel')).toHaveClass('hidden')
    expect(document.getElementById('award-li-commentary-panel')).toHaveClass('hidden')
  })

  it('opens one editor at a time and forwards prompt edits', async () => {
    const user = userEvent.setup()
    const props = renderBody()

    await user.click(screen.getByRole('button', { name: 'Cover image prompt' }))

    expect(screen.getByRole('button', { name: 'Cover image prompt' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Post text' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )

    await user.type(screen.getByLabelText('Edit prompt before regenerating'), '!')

    expect(props.onCoverPromptChange).toHaveBeenCalledWith('A gold medal!')
    expect(props.onCommentaryChange).not.toHaveBeenCalled()
  })

  it('shows a generation error and blocks edits while a request is in flight', async () => {
    const user = userEvent.setup()
    renderBody({ isBusy: true, generateError: 'Cover generation failed' })

    expect(screen.getByRole('alert')).toHaveTextContent('Cover generation failed')
    expect(screen.getByRole('button', { name: 'Regenerate cover' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Regenerate post' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Post text' }))
    expect(screen.getByLabelText('Edit before publishing')).toBeDisabled()
    expect(screen.getByLabelText('Edit prompt before regenerating')).toBeDisabled()
  })

  it('does not render an alert when generation succeeded', () => {
    renderBody({ generateError: null })

    expect(screen.queryByRole('alert')).toBeNull()
  })
})
