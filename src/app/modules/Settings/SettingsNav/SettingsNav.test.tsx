import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { SettingsNav } from './SettingsNav'
import type { SettingsNavItem } from './SettingNav.types'

const items: SettingsNavItem[] = [
  { value: 'general', label: 'General', content: <p>General panel</p> },
  {
    value: 'email',
    label: 'Email',
    content: <p>Email panel</p>,
    disabled: true,
  },
  { value: 'danger', label: 'Danger', content: <p>Danger panel</p> },
]

function panel(text: string) {
  const node = screen.getByText(text).closest('[role="tabpanel"]')
  if (!node) throw new Error(`Missing tab panel for ${text}`)
  return node
}

describe('SettingsNav', () => {
  afterEach(() => {
    cleanup()
  })

  it('selects the first enabled tab and skips disabled tabs with arrows', async () => {
    const user = userEvent.setup()
    render(<SettingsNav items={items} />)

    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Email' })).toBeDisabled()
    expect(panel('General panel')).not.toHaveAttribute('hidden')
    expect(panel('Email panel')).toHaveAttribute('hidden')

    screen.getByRole('tab', { name: 'General' }).focus()
    await user.keyboard('{ArrowDown}')

    expect(screen.getByRole('tab', { name: 'Danger' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(panel('Danger panel')).not.toHaveAttribute('hidden')
    expect(panel('General panel')).toHaveAttribute('hidden')

    await user.keyboard('{ArrowDown}')
    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute(
      'aria-selected',
      'true',
    )

    await user.keyboard('{ArrowUp}')
    expect(screen.getByRole('tab', { name: 'Danger' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('ignores horizontal arrows and does not activate a disabled tab', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<SettingsNav items={items} onValueChange={onValueChange} />)

    screen.getByRole('tab', { name: 'General' }).focus()
    await user.keyboard('{ArrowRight}{ArrowLeft}')

    expect(screen.getByRole('tab', { name: 'General' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(onValueChange).not.toHaveBeenCalled()
    expect(panel('Email panel')).toHaveAttribute('hidden')
  })

  it('keeps the controlled panel until the value prop changes', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <SettingsNav
        items={items}
        value="general"
        onValueChange={onValueChange}
      />,
    )

    await user.click(screen.getByRole('tab', { name: 'Danger' }))

    expect(onValueChange).toHaveBeenCalledWith('danger')
    expect(panel('General panel')).not.toHaveAttribute('hidden')
    expect(panel('Danger panel')).toHaveAttribute('hidden')
  })

  it('resets an uncontrolled selection when that tab becomes disabled', () => {
    const { rerender } = render(<SettingsNav items={items} />)
    expect(panel('General panel')).not.toHaveAttribute('hidden')

    rerender(
      <SettingsNav
        items={[
          { ...items[0], disabled: true },
          { ...items[1], disabled: false },
          items[2],
        ]}
      />,
    )

    expect(screen.getByRole('tab', { name: 'Email' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(panel('Email panel')).not.toHaveAttribute('hidden')
    expect(panel('General panel')).toHaveAttribute('hidden')
  })
})
