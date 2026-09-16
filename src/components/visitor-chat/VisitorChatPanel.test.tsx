import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VisitorChatPanel } from './VisitorChatPanel'

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
})

const idleProps = {
  rootId: 'chat-root',
  messages: [],
  hydrated: true,
  isSending: false,
  error: null as string | null,
  draft: '',
  onDraftChange: vi.fn(),
  onSend: vi.fn(),
  onClose: vi.fn(),
}

describe('VisitorChatPanel', () => {
  it('keeps send disabled until hydrated, then while sending or whitespace-only', () => {
    const { rerender } = render(
      <VisitorChatPanel {...idleProps} hydrated={false} draft="Hello" />,
    )

    expect(screen.getByText('Loading conversation…')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask a question…')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()

    rerender(<VisitorChatPanel {...idleProps} draft="Hello" />)
    expect(screen.getByRole('button', { name: 'Send message' })).toBeEnabled()

    rerender(<VisitorChatPanel {...idleProps} draft="   " />)
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()

    rerender(
      <VisitorChatPanel {...idleProps} draft="Hello" isSending />,
    )
    expect(screen.getByRole('button', { name: 'Send message' })).toBeDisabled()
    expect(screen.getByText(/Generating reply/)).toBeInTheDocument()
  })

  it('sends on Enter but not Shift+Enter, and surfaces transcript errors', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    const onDraftChange = vi.fn()

    render(
      <VisitorChatPanel
        {...idleProps}
        draft="Can I join?"
        error="Assistant is busy"
        onSend={onSend}
        onDraftChange={onDraftChange}
      />,
    )

    expect(screen.getByText('Assistant is busy')).toBeInTheDocument()

    const input = screen.getByPlaceholderText('Ask a question…')
    await user.type(input, '{Shift>}{Enter}{/Shift}')
    expect(onSend).not.toHaveBeenCalled()

    await user.type(input, '{Enter}')
    expect(onSend).toHaveBeenCalledTimes(1)
  })
})
