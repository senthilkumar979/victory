import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MarkdownContent } from './MarkdownContent'

afterEach(() => {
  cleanup()
})

describe('MarkdownContent', () => {
  it('renders markdown links and GFM tables as elements', () => {
    const { container } = render(
      <MarkdownContent
        className="mt-4"
        content={[
          'See [students](https://www.mentorbridge.in/students).',
          '',
          '| Topic | Status |',
          '| --- | --- |',
          '| React | done |',
        ].join('\n')}
      />,
    )

    expect(container.firstElementChild).toHaveClass('prose', 'mt-4')
    expect(screen.getByRole('link', { name: 'students' })).toHaveAttribute(
      'href',
      'https://www.mentorbridge.in/students',
    )
    expect(screen.getByRole('cell', { name: 'React' })).toBeInTheDocument()
  })

  it('escapes raw HTML instead of mounting script or image nodes', () => {
    const { container } = render(
      <MarkdownContent
        content={'<script>alert(1)</script>\n<img src="x" onerror="alert(1)" />'}
      />,
    )

    expect(container.querySelector('script')).toBeNull()
    expect(container.querySelector('img')).toBeNull()
    expect(container.innerHTML).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(container.innerHTML).toContain('&lt;img')
  })

  it('does not emit a javascript URL from a markdown link', () => {
    const { container } = render(
      <MarkdownContent content="[click](javascript:alert(1))" />,
    )

    expect(container.textContent).toContain('click')
    expect(container.innerHTML.toLowerCase()).not.toContain('javascript:')
    expect(container.querySelector('script')).toBeNull()
  })

  it('renders an empty document without extra nodes', () => {
    const { container } = render(<MarkdownContent content="" />)

    expect(container.querySelector('.prose')?.textContent).toBe('')
    expect(container.querySelector('script')).toBeNull()
  })
})
