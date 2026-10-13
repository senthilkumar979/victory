import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { AwardLinkedInExpandableSection } from './AwardLinkedInExpandableSection'

const sectionProps = {
  title: 'Cover image prompt',
  toggleId: 'award-cover-prompt-toggle',
  panelId: 'award-cover-prompt-panel',
}

describe('AwardLinkedInExpandableSection', () => {
  afterEach(() => {
    cleanup()
  })

  it('keeps the editor collapsed and asks the parent to toggle', () => {
    const onToggle = vi.fn()

    render(
      <AwardLinkedInExpandableSection
        {...sectionProps}
        open={false}
        onToggle={onToggle}
      >
        <textarea aria-label="Cover prompt" />
      </AwardLinkedInExpandableSection>,
    )

    const toggle = screen.getByRole('button', { name: 'Cover image prompt' })
    const panel = document.getElementById('award-cover-prompt-panel')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'award-cover-prompt-panel')
    expect(panel).toHaveAttribute('role', 'region')
    expect(panel).toHaveAttribute(
      'aria-labelledby',
      'award-cover-prompt-toggle',
    )
    expect(panel).toHaveClass('hidden')
    expect(screen.getByRole('textbox', { name: 'Cover prompt', hidden: true })).toBeInTheDocument()
    expect(toggle.querySelector('svg')).not.toHaveClass('rotate-180')

    fireEvent.click(toggle)

    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('reveals the panel and marks it expanded when open', () => {
    render(
      <AwardLinkedInExpandableSection
        {...sectionProps}
        open
        onToggle={vi.fn()}
      >
        <textarea aria-label="Cover prompt" />
      </AwardLinkedInExpandableSection>,
    )

    const toggle = screen.getByRole('button', { name: 'Cover image prompt' })
    const panel = document.getElementById('award-cover-prompt-panel')

    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    expect(panel).not.toHaveClass('hidden')
    expect(screen.getByRole('textbox', { name: 'Cover prompt' })).toBeVisible()
    expect(toggle.querySelector('svg')).toHaveClass('rotate-180')
  })
})
