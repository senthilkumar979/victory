import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { InterviewPrepCodePanel } from './InterviewPrepCodePanel'

afterEach(() => {
  cleanup()
})

describe('InterviewPrepCodePanel', () => {
  it('renders code as text and a language chip without a file path', () => {
    const code = 'const answer = 1\n<script>alert(1)</script>'
    const { container } = render(
      <InterviewPrepCodePanel code={code} language="javascript" />,
    )

    expect(container.querySelector('code')?.textContent).toBe(code)
    expect(screen.getByText('javascript')).toHaveClass('uppercase')
    expect(screen.queryByText('utils/cart.js')).not.toBeInTheDocument()
    expect(container.innerHTML).not.toContain('<script>alert(1)</script>')
  })

  it('shows the solution file path and hides an empty path or language', () => {
    const { container, rerender } = render(
      <InterviewPrepCodePanel
        code="export const total = 1"
        language="typescript"
        filePath="utils/cart.ts"
      />,
    )

    expect(screen.getByText('utils/cart.ts')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toHaveClass('uppercase')

    rerender(
      <InterviewPrepCodePanel
        code="export const total = 1"
        filePath=""
        language=""
      />,
    )

    expect(screen.queryByText('utils/cart.ts')).not.toBeInTheDocument()
    expect(screen.queryByText('typescript')).not.toBeInTheDocument()
    expect(container.querySelector('code')?.textContent).toBe(
      'export const total = 1',
    )
  })
})
