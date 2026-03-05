import type { Meta, StoryObj } from '@storybook/react'
import { UserSearch } from './UserSearch'

const meta: Meta<typeof UserSearch> = {
  title: 'Molecules/UserSearch',
  component: UserSearch,
  args: {
    placeholder: 'Search students by name...',
    onSelect: (student) => {
      // eslint-disable-next-line no-console
      console.log('Selected student:', student)
    },
  },
}

export default meta

type Story = StoryObj<typeof UserSearch>

export const Default: Story = {}

export const AutoFocused: Story = {
  args: {
    autoFocus: true,
  },
}

