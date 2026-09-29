import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { VisitorChatTranscript } from './VisitorChatTranscript'

const { renderChatRichContentMock } = vi.hoisted(() => ({
  renderChatRichContentMock: vi.fn((text: string) => text),
}))

vi.mock('@/lib/renderChatRichContent', () => ({
  renderChatRichContent: (text: string, options: unknown) =>
    renderChatRichContentMock(text, options),
}))

vi.mock('./VisitorAssistantMessage', () => ({
  VisitorAssistantMessage: function VisitorAssistantMessage({
    content,
  }: {
    content: string
  }) {
    return <div data-testid="assistant-message">{content}</div>
  },
}))

const scrollIntoView = vi.fn()

beforeEach(() => {
  scrollIntoView.mockReset()
  renderChatRichContentMock.mockClear()
  Element.prototype.scrollIntoView = scrollIntoView
})

afterEach(() => {
  cleanup()
})

describe('VisitorChatTranscript', () => {
  it('hides messages and does not scroll until the conversation is hydrated', () => {
    render(
      <VisitorChatTranscript
        messages={[{ role: 'user', content: 'Hello from a visitor' }]}
        hydrated={false}
        isSending={false}
        error={null}
      />,
    )

    expect(screen.getByText('Loading conversation…')).toBeInTheDocument()
    expect(screen.queryByText('Hello from a visitor')).not.toBeInTheDocument()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('renders user text with primary links and assistant text separately', () => {
    render(
      <VisitorChatTranscript
        messages={[
          { role: 'user', content: 'See https://mentorbridge.in' },
          { role: 'assistant', content: 'Ask the mentor team' },
        ]}
        hydrated
        isSending
        error="The assistant is unavailable"
      />,
    )

    expect(screen.queryByText('Loading conversation…')).not.toBeInTheDocument()
    expect(renderChatRichContentMock).toHaveBeenCalledWith(
      'See https://mentorbridge.in',
      { linkOnPrimary: true },
    )
    expect(screen.getByTestId('assistant-message')).toHaveTextContent(
      'Ask the mentor team',
    )
    expect(renderChatRichContentMock).not.toHaveBeenCalledWith(
      'Ask the mentor team',
      expect.anything(),
    )
    expect(screen.getByText('Generating reply')).toBeInTheDocument()
    expect(screen.getByText('The assistant is unavailable')).toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
  })

  it('shows the generating state while hydration is still pending', () => {
    render(
      <VisitorChatTranscript
        messages={[]}
        hydrated={false}
        isSending
        error={null}
      />,
    )

    expect(screen.getByText('Loading conversation…')).toBeInTheDocument()
    expect(screen.getByText('Generating reply')).toBeInTheDocument()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
