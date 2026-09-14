import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from './Award.types'
import { AwardRowActions } from './AwardRowActions'

const baseAward: AwardFormState = {
  id: 'award-1',
  awardedTo: 'ada@mentorbridge.in',
  awardedOn: '2026-03-15',
  description: 'Outstanding contribution',
  awardCategoryId: 'cat-1',
}

afterEach(() => {
  cleanup()
})

async function openActions(award: AwardFormState = baseAward) {
  const handlers = {
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onPublishToLinkedIn: vi.fn(),
    onSendAwardEmail: vi.fn(),
  }
  render(<AwardRowActions award={award} {...handlers} />)
  await userEvent
    .setup()
    .click(
      screen.getByRole('button', {
        name: /Actions for award/,
      }),
    )
  return handlers
}

describe('AwardRowActions', () => {
  it('invokes the matching row action from the menu', async () => {
    const user = userEvent.setup()
    const cases = [
      ['Edit', 'onEdit'],
      ['Publish to LinkedIn', 'onPublishToLinkedIn'],
      ['Send award email', 'onSendAwardEmail'],
      ['Delete', 'onDelete'],
    ] as const

    for (const [label, handler] of cases) {
      cleanup()
      const handlers = await openActions()
      await user.click(screen.getByRole('menuitem', { name: label }))
      expect(handlers[handler]).toHaveBeenCalledWith(baseAward)
    }
  })

  it('disables LinkedIn publish when the award has no id', async () => {
    const handlers = await openActions({ ...baseAward, id: undefined })

    expect(
      screen.getByRole('menuitem', { name: 'Publish to LinkedIn' }),
    ).toHaveAttribute('aria-disabled', 'true')
    expect(handlers.onPublishToLinkedIn).not.toHaveBeenCalled()
  })

  it('disables award email when the recipient is blank or whitespace', async () => {
    await openActions({ ...baseAward, awardedTo: '   ' })

    expect(
      screen.getByRole('menuitem', { name: 'Send award email' }),
    ).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows sending state and blocks a second send for the same award', async () => {
    render(
      <AwardRowActions
        award={baseAward}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onPublishToLinkedIn={vi.fn()}
        onSendAwardEmail={vi.fn()}
        sendingEmailId="award-1"
      />,
    )
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: /Actions for award/ }))

    const emailItem = screen.getByRole('menuitem', { name: 'Sending email…' })
    expect(emailItem).toHaveAttribute('aria-disabled', 'true')
  })
})
