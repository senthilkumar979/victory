import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Calendar } from './Calendar'

const meta: Meta<typeof Calendar> = {
  title: 'Molecules/Calendar',
  component: Calendar,
  argTypes: {
    isDarkMode: {
      control: 'boolean',
      description: 'Use dark theme styling',
    },
  },
  args: {
    isDarkMode: false,
  },
  decorators: [
    (Story, context) => {
      const [selected, setSelected] = useState<Date | undefined>(undefined)
      return (
        <Story
          args={{
            ...context.args,
            selected,
            onSelect: setSelected,
          }}
        />
      )
    },
  ],
}

export default meta

type Story = StoryObj<typeof Calendar>

export const Default: Story = {}

export const DarkMode: Story = {
  args: {
    isDarkMode: true,
  },
  decorators: [
    (Story, context) => {
      const [selected, setSelected] = useState<Date | undefined>(undefined)
      return (
        <div className="rounded-lg bg-slate-900 p-4">
          <Story
            args={{
              ...context.args,
              selected,
              onSelect: setSelected,
            }}
          />
        </div>
      )
    },
  ],
}

export const WithPreselectedDate: Story = {
  args: {},
  decorators: [
    (Story, context) => {
      const [selected, setSelected] = useState<Date | undefined>(
        () => new Date(2025, 2, 15),
      )
      return (
        <Story
          args={{
            ...context.args,
            selected,
            onSelect: setSelected,
          }}
        />
      )
    },
  ],
}
