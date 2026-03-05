import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'

import { Drawer } from './Drawer'

const meta: Meta<typeof Drawer> = {
  title: 'Organisms/Drawer',
  component: Drawer,
  args: {
    side: 'right',
    size: 'md',
    showCloseButton: true,
  },
}

export default meta

type Story = StoryObj<typeof Drawer>

export const Preview: Story = {
  render: (storyArgs) => {
    const [isOpen, setIsOpen] = useState(true)

    return (
      <>
        <button
          type="button"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          onClick={() => setIsOpen(true)}
        >
          Open drawer
        </button>

        <Drawer {...storyArgs} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Drawer.Title description="Fine-tune the experience for this workspace with a focused, ambient side panel.">
            Workspace preferences
          </Drawer.Title>
          <Drawer.Body>
            <div className="space-y-4">
              <section className="space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Appearance
                </h3>
                <p className="text-xs text-slate-400">
                  Switch between themes, adjust density, and control how information is surfaced
                  across the app.
                </p>
              </section>

              <section className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 p-3 sm:grid-cols-2">
                <button
                  type="button"
                  className="flex flex-col items-start gap-1 rounded-lg border border-transparent bg-slate-900/80 px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:border-primary/60 hover:bg-primary/10"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    System
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Match your OS to keep things cohesive.
                  </span>
                </button>
                <button
                  type="button"
                  className="flex flex-col items-start gap-1 rounded-lg border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:border-primary/60 hover:bg-primary/10"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200">
                    High contrast
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Increase legibility with bolder accents.
                  </span>
                </button>
              </section>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-slate-700/70 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              Save changes
            </button>
          </Drawer.Footer>
        </Drawer>
      </>
    )
  },
}

