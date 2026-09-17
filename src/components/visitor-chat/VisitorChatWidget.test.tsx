import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sendUserMessage = vi.fn()

const chatState = {
  messages: [] as { role: 'user' | 'assistant'; content: string }[],
  hydrated: true,
  isSending: false,
  error: null as string | null,
  sendUserMessage,
}

vi.mock('@/hooks/useVisitorChat', () => ({
  useVisitorChat: () => chatState,
}))

function VisitorChatPanelMock({
  draft,
  onDraftChange,
  onSend,
  onClose,
}: {
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  onClose: () => void
}) {
  return (
    <div>
      <textarea
        aria-label="Message"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
      />
      <button type="button" onClick={onSend}>
        Send
      </button>
      <button type="button" onClick={onClose}>
        Close panel
      </button>
    </div>
  )
}

vi.mock('./VisitorChatPanel', () => ({
  VisitorChatPanel: VisitorChatPanelMock,
}))

import { VisitorChatWidget } from './VisitorChatWidget'

beforeEach(() => {
  chatState.hydrated = true
  chatState.isSending = false
  chatState.error = null
  sendUserMessage.mockReset()
  sendUserMessage.mockResolvedValue(undefined)
})

afterEach(() => {
  cleanup()
})

describe('VisitorChatWidget', () => {
  it('keeps the panel closed until the assistant is opened', () => {
    render(<VisitorChatWidget />)

    expect(
      screen.getByRole('button', { name: 'Open MentorBridge assistant' }),
    ).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
  })

  it('does not send whitespace drafts and trims real messages', async () => {
    const user = userEvent.setup()
    render(<VisitorChatWidget />)

    await user.click(
      screen.getByRole('button', { name: 'Open MentorBridge assistant' }),
    )

    await user.type(screen.getByLabelText('Message'), '   ')
    await user.click(screen.getByRole('button', { name: 'Send' }))
    expect(sendUserMessage).not.toHaveBeenCalled()

    await user.clear(screen.getByLabelText('Message'))
    await user.type(screen.getByLabelText('Message'), '  hello cohort  ')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(sendUserMessage).toHaveBeenCalledWith('hello cohort')
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  it('ignores send while a reply is in flight', async () => {
    const user = userEvent.setup()
    chatState.isSending = true
    render(<VisitorChatWidget />)

    await user.click(
      screen.getByRole('button', { name: 'Open MentorBridge assistant' }),
    )
    await user.type(screen.getByLabelText('Message'), 'hello')
    await user.click(screen.getByRole('button', { name: 'Send' }))

    expect(sendUserMessage).not.toHaveBeenCalled()
  })

  it('closes the panel from the floating button and the panel close action', async () => {
    const user = userEvent.setup()
    render(<VisitorChatWidget />)

    await user.click(
      screen.getByRole('button', { name: 'Open MentorBridge assistant' }),
    )
    expect(screen.getByLabelText('Message')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Close panel' }))
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Open MentorBridge assistant' }),
    )
    await user.click(
      screen.getByRole('button', { name: 'Close MentorBridge assistant' }),
    )
    expect(screen.queryByLabelText('Message')).not.toBeInTheDocument()
  })
})
