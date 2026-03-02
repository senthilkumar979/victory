import type { Meta, StoryObj } from '@storybook/react'
import { FormInput } from './FormInput'

const meta: Meta<typeof FormInput> = {
  title: 'Molecules/FormInput',
  component: FormInput,
  argTypes: {
    validationStatus: {
      control: 'radio',
      options: ['default', 'valid', 'invalid'],
    },
    helperText: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
  },
  args: {
    label: 'Label',
    placeholder: 'Enter value',
    helperText: 'Optional helper text',
    validationStatus: 'default',
    isRequired: false,
  },
}

export default meta

type Story = StoryObj<typeof FormInput>

export const Default: Story = {}

export const Valid: Story = {
  args: {
    validationStatus: 'valid',
    helperText: 'Looks good.',
    isRequired: true,
  },
}

export const Invalid: Story = {
  args: {
    validationStatus: 'invalid',
    errorMessage: 'This field is required.',
    isRequired: true,
  },
}
