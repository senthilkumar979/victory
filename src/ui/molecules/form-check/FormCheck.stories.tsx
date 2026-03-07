import type { Meta, StoryObj } from '@storybook/react'
import { FormCheck } from './FormCheck'

const meta: Meta<typeof FormCheck> = {
  title: 'Molecules/FormCheck',
  component: FormCheck,
  argTypes: {
    type: {
      control: 'radio',
      options: ['checkbox', 'radio'],
    },
    helperText: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
  },
  args: {
    type: 'checkbox',
    label: 'Remember me',
    helperText: 'We will keep you signed in on this device.',
  },
}

export default meta

type Story = StoryObj<typeof FormCheck>

export const Checkbox: Story = {}

export const CheckboxWithError: Story = {
  args: {
    errorMessage: 'You must accept the terms.',
  },
}

export const Radio: Story = {
  args: {
    type: 'radio',
    label: 'Select this option',
    helperText: 'This is a radio option.',
  },
}

