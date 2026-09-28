import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { GeneralSettings } from './GeneralSettings'

function panel(label: string) {
  return function SettingsPanel() {
    return <div>{label}</div>
  }
}

vi.mock('framer-motion', () => {
  function strip(props: Record<string, unknown>) {
    const rest = { ...props }
    for (const key of ['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'layoutId']) {
      delete rest[key]
    }
    return rest
  }
  const Tag = (tag: string) =>
    function MotionTag({ children, ...props }: { children?: ReactNode }) {
      const Comp = tag as 'div'
      return <Comp {...strip(props)}>{children}</Comp>
    }
  return {
    AnimatePresence: function AnimatePresence({ children }: { children: ReactNode }) {
      return <>{children}</>
    },
    LayoutGroup: function LayoutGroup({ children }: { children: ReactNode }) {
      return <>{children}</>
    },
    motion: { nav: Tag('nav'), button: Tag('button'), div: Tag('div'), span: Tag('span') },
  }
})

vi.mock('../../Announcements/AdminAnnouncement', () => ({
  AdminAnnouncement: panel('Announcements panel'),
}))
vi.mock('../../Assignments/Assignments', () => ({
  Assignments: panel('Assignments panel'),
}))
vi.mock('../../AwardCategories', () => ({
  AwardCategories: panel('Award Categories panel'),
}))
vi.mock('../../Awards/Awards', () => ({
  Awards: panel('Awards panel'),
}))
vi.mock('../../Presenters/Presenters', () => ({
  Presenters: panel('Presenters panel'),
}))
vi.mock('../../GoogleGroups', () => ({
  GoogleGroups: panel('Google Groups panel'),
}))
vi.mock('../../HallOfFame/HallOfFame', () => ({
  HallOfFame: panel('Hall of Fame panel'),
}))
vi.mock('../../Meetings/AdminMeetings', () => ({
  AdminMeetings: panel('Meetings panel'),
}))
vi.mock('../../Partners/Partners', () => ({
  Partners: panel('Partners panel'),
}))
vi.mock('../../Students/Students', () => ({
  Students: panel('Students panel'),
}))
vi.mock('../../Videos/Videos', () => ({
  Videos: panel('Videos panel'),
}))
vi.mock('./VisitorQueries', () => ({
  VisitorQueries: panel('Visitor Queries panel'),
}))

afterEach(() => {
  cleanup()
  window.location.hash = ''
})

describe('GeneralSettings', () => {
  it('follows the location hash and ignores unknown tabs', async () => {
    const user = userEvent.setup()
    window.location.hash = '#awards'

    render(<GeneralSettings />)

    expect(screen.getByText('Awards panel')).toBeInTheDocument()
    expect(screen.queryByText('Google Groups panel')).not.toBeInTheDocument()

    await act(async () => {
      window.history.replaceState(null, '', window.location.pathname)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(window.location.hash).toBe('')
    expect(screen.getByText('Google Groups panel')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Meetings/ }))
    expect(window.location.hash).toBe('#meetings')
    expect(screen.getByText('Meetings panel')).toBeInTheDocument()

    await act(async () => {
      window.location.hash = '#not-a-tab'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(screen.queryByText(/panel$/)).not.toBeInTheDocument()
  })
})
