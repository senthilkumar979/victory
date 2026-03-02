import type { Meta, StoryObj } from '@storybook/react'
import { FormLabel } from './FormLabel'

const meta: Meta<typeof FormLabel> = {
  title: 'Atoms/FormLabel',
  component: FormLabel,
  argTypes: {
    isRequired: {
      control: 'boolean',
    },
    children: {
      control: 'text',
    },
  },
  args: {
    children: 'Label',
    isRequired: false,
  },
}

export default meta

type Story = StoryObj<typeof FormLabel>

export const Default: Story = {}

export const Required: Story = {
  args: {
    isRequired: true,
  },
}

