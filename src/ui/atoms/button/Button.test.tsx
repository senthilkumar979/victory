import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  Button,
  ErrorButton,
  InfoButton,
  PrimaryButton,
  SecondaryButton,
  TertiaryButton,
  TextButton,
} from './Button'

function buttonClass(name: string): string {
  return screen.getByRole('button', { name }).className
}

afterEach(() => {
  cleanup()
})

describe('Button', () => {
  it('maps each solid and outline variant onto its theme class', () => {
    render(
      <>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary" mode="outline">
          Secondary outline
        </Button>
        <Button variant="text">Text</Button>
        <Button variant="text" mode="outline">
          Text outline
        </Button>
        <Button variant="tertiary">Tertiary</Button>
        <Button variant="tertiary" mode="outline">
          Tertiary outline
        </Button>
        <Button variant="error">Error</Button>
        <Button variant="error" mode="outline">
          Error outline
        </Button>
        <Button variant="success">Success</Button>
        <Button variant="success" mode="outline">
          Success outline
        </Button>
        <Button variant="info">Info</Button>
        <Button variant="textSecondary">Text secondary</Button>
        <Button variant="textError">Text error</Button>
        <Button mode="outline">Primary outline</Button>
      </>,
    )

    expect(buttonClass('Primary')).toContain(
      'bg-primary text-primary-foreground',
    )
    expect(buttonClass('Secondary')).toContain('bg-secondary')
    expect(buttonClass('Secondary outline')).toContain('border border-secondary')
    expect(buttonClass('Text outline')).toContain('border border-transparent')
    expect(buttonClass('Tertiary')).toContain('bg-muted')
    expect(buttonClass('Tertiary outline')).toContain('border border-muted')
    expect(buttonClass('Error')).toContain('bg-red-500')
    expect(buttonClass('Error outline')).toContain('border border-red-500')
    expect(buttonClass('Success')).toContain('bg-success')
    expect(buttonClass('Success outline')).toContain('border border-success')
    expect(buttonClass('Info')).toContain('bg-info text-info-foreground')
    expect(buttonClass('Text secondary')).toContain('text-secondary')
    expect(buttonClass('Text error')).toContain('text-red-500')
    expect(buttonClass('Primary outline')).toContain('border border-primary')
  })

  it('resolves outline mode before info and text* variants', () => {
    render(
      <>
        <Button variant="info" mode="outline">
          Info outline
        </Button>
        <Button variant="textWarning" mode="outline">
          Text warning outline
        </Button>
      </>,
    )

    expect(buttonClass('Info outline')).toContain('border border-primary')
    expect(buttonClass('Info outline')).not.toContain('border border-info')
    expect(buttonClass('Text warning outline')).not.toContain('text-warning')
  })

  it('applies size, type, disabled, and extra classes', () => {
    render(
      <>
        <Button size="sm">Small</Button>
        <Button size="lg" type="submit" disabled className="extra-class">
          Large
        </Button>
      </>,
    )

    expect(buttonClass('Small')).toContain('px-3 py-1.5 text-sm')
    expect(screen.getByRole('button', { name: 'Small' })).toHaveAttribute(
      'type',
      'button',
    )
    const large = screen.getByRole('button', { name: 'Large' })
    expect(large.className).toContain('px-5 py-2.5 text-base')
    expect(large.className).toContain('extra-class')
    expect(large).toHaveAttribute('type', 'submit')
    expect(large).toBeDisabled()
  })

  it('keeps convenience wrappers on their variants unless TextButton overrides', () => {
    render(
      <>
        <PrimaryButton variant="error">Primary wrapper</PrimaryButton>
        <SecondaryButton>Secondary wrapper</SecondaryButton>
        <TertiaryButton>Tertiary wrapper</TertiaryButton>
        <ErrorButton>Error wrapper</ErrorButton>
        <InfoButton>Info wrapper</InfoButton>
        <TextButton>Text wrapper</TextButton>
        <TextButton variant="textSuccess">Text success wrapper</TextButton>
      </>,
    )

    expect(buttonClass('Primary wrapper')).toContain(
      'bg-primary text-primary-foreground',
    )
    expect(buttonClass('Primary wrapper')).not.toContain('bg-red-500')
    expect(buttonClass('Secondary wrapper')).toContain('bg-secondary')
    expect(buttonClass('Tertiary wrapper')).toContain('bg-muted')
    expect(buttonClass('Error wrapper')).toContain('bg-red-500')
    expect(buttonClass('Info wrapper')).toContain('bg-info')
    expect(buttonClass('Text wrapper')).toContain('text-primary')
    expect(buttonClass('Text success wrapper')).toContain('text-success')
  })
})
