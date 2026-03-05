import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { RichTextEditor } from './RichTextEditor'

const meta: Meta<typeof RichTextEditor> = {
  title: 'Organisms/RichTextEditor',
  component: RichTextEditor,
  args: {
    id: 'rich-text-editor',
    label: 'Description',
    placeholder: 'Write something engaging...',
  },
}

export default meta

type Story = StoryObj<typeof RichTextEditor>

export const Default: Story = {
  render: (storyArgs) => {
    const [value, setValue] = useState(
      '<p>This is a <strong>rich text</strong> editor.</p>',
    )

    return (
      <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <RichTextEditor
          {...storyArgs}
          value={value}
          handleChange={(nextValue) => setValue(nextValue)}
        />
        <div className="rounded-md border border-dashed border-slate-700/70 bg-slate-900/70 p-3 text-xs text-slate-400">
          <div className="mb-1 font-semibold text-slate-300">
            Current HTML value
          </div>
          <pre className="whitespace-pre-wrap break-words text-[11px]">
            {value}
          </pre>
        </div>
      </div>
    )
  },
}

export const DarkMode: Story = {
  render: (storyArgs) => {
    const [value, setValue] = useState(
      '<p>This is a <strong>rich text</strong> editor in dark mode.</p>',
    )

    return (
      <div className="max-w-2xl space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/80 p-4">
        <RichTextEditor
          {...storyArgs}
          isDarkMode
          value={value}
          handleChange={(nextValue) => setValue(nextValue)}
        />
        <div className="rounded-md border border-dashed border-slate-700/70 bg-slate-900/70 p-3 text-xs text-slate-400">
          <div className="mb-1 font-semibold text-slate-300">
            Current HTML value
          </div>
          <pre className="whitespace-pre-wrap break-words text-[11px]">
            {value}
          </pre>
        </div>
      </div>
    )
  },
}
