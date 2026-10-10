import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MarkdownEditor } from './MarkdownEditor'

vi.mock('@/components/assignments/MarkdownContent', () => ({
  MarkdownContent: ({ content }: { content: string }) => (
    <div data-testid="markdown-preview">{content}</div>
  ),
}))

afterEach(() => {
  cleanup()
})

describe('MarkdownEditor', () => {
  it('edits markdown on the write tab and shows a validation error', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(
      <MarkdownEditor
        id="description"
        value="Hello"
        onChange={onChange}
        error="Description is required"
      />,
    )

    const editor = screen.getByPlaceholderText(
      'Write assignment description in Markdown...',
    )
    expect(editor).toHaveValue('Hello')
    expect(editor.className).toContain('border-red-500')
    expect(screen.getByText('Description is required')).toBeInTheDocument()

    await user.type(editor, '!')
    expect(onChange).toHaveBeenCalledWith('Hello!')
  })

  it('previews the written markdown and substitutes a placeholder when it is empty', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <MarkdownEditor id="description" value="**Bold**" onChange={vi.fn()} />,
    )

    await user.click(screen.getByRole('button', { name: 'preview' }))

    expect(
      screen.queryByPlaceholderText('Write assignment description in Markdown...'),
    ).toBeNull()
    expect(screen.getByTestId('markdown-preview')).toHaveTextContent('**Bold**')

    rerender(
      <MarkdownEditor id="description" value="" onChange={vi.fn()} />,
    )

    expect(screen.getByTestId('markdown-preview')).toHaveTextContent(
      '_Nothing to preview_',
    )
  })
})
