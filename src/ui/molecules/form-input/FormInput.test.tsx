import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FormInput } from './FormInput'

describe('FormInput', () => {
  afterEach(() => {
    cleanup()
  })

  it('derives an id from the label and wires error text before helper text', () => {
    render(
      <FormInput
        label="Work Email"
        helperText="Use your company address"
        errorMessage="Email is required"
        validationStatus="invalid"
        isRequired
      />,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'work-email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute(
      'aria-describedby',
      'work-email-error work-email-helper',
    )
    expect(screen.getByText('Email is required')).toHaveAttribute(
      'id',
      'work-email-error',
    )
    expect(screen.getByText('Use your company address')).toHaveAttribute(
      'id',
      'work-email-helper',
    )
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('hides an error message unless the field is invalid', () => {
    const { rerender } = render(
      <FormInput
        label="Title"
        errorMessage="Title is required"
        helperText="Shown on the card"
        validationStatus="default"
      />,
    )

    const input = screen.getByRole('textbox')
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).toHaveAttribute('aria-describedby', 'title-helper')

    rerender(
      <FormInput
        label="Title"
        errorMessage="Title is required"
        validationStatus="valid"
      />,
    )

    const validInput = screen.getByRole('textbox')
    expect(screen.queryByText('Title is required')).not.toBeInTheDocument()
    expect(validInput).not.toHaveAttribute('aria-invalid')
    expect(validInput).not.toHaveAttribute('aria-describedby')
  })

  it('marks invalid fields even when the message is missing', () => {
    render(
      <FormInput label="  Email" validationStatus="invalid" />,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', '-email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).not.toHaveAttribute('aria-describedby')
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument()
  })

  it('keeps an explicit id when the label is not a string', () => {
    render(
      <FormInput
        id="custom-name"
        label={<span>Name</span>}
        readOnly
        validationStatus="valid"
      />,
    )

    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('id', 'custom-name')
    expect(input).toHaveAttribute('readonly')
    expect(input.className).toContain('pointer-events-none')
    expect(input).not.toHaveAttribute('aria-invalid')
  })
})
