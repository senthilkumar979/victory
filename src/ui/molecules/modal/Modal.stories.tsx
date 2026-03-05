import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Modal } from './Modal'

const meta: Meta<typeof Modal> = {
  title: 'Molecules/Modal',
  component: Modal,
  args: {
    size: 'md',
    showCloseButton: true,
  },
}

export default meta

type Story = StoryObj<typeof Modal>

export const Preview: Story = {
  render: (storyArgs) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={() => setIsOpen(true)}
        >
          Open modal
        </button>

        <Modal {...storyArgs} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Modal.Title>New deployment ready</Modal.Title>
          <Modal.Body>
            This modal is rendered inside a glassy, gradient frame with subtle
            motion transitions to feel like part of a system console rather
            than a generic dialog.
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Dismiss
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              View logs
            </button>
          </Modal.Footer>
        </Modal>
      </>
    )
  },
}

