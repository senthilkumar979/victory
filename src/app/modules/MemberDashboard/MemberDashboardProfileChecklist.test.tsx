import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { MemberDashboardProfileChecklist } from './MemberDashboardProfileChecklist'

afterEach(() => {
  cleanup()
})

describe('MemberDashboardProfileChecklist', () => {
  it('counts incomplete items and marks done rows', () => {
    render(
      <MemberDashboardProfileChecklist
        items={[
          { id: 'name', label: 'Full name', done: true },
          { id: 'role', label: 'Role / title', done: false },
          { id: 'resume', label: 'Resume link', done: false },
        ]}
      />,
    )

    expect(screen.getByText('2 to improve')).toBeInTheDocument()
    expect(screen.getByLabelText('Done')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Not done')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Edit profile' })).toHaveAttribute(
      'href',
      '/secured/profile',
    )
  })

  it('shows All set when every checklist item is done', () => {
    render(
      <MemberDashboardProfileChecklist
        items={[
          { id: 'name', label: 'Full name', done: true },
          { id: 'role', label: 'Role / title', done: true },
        ]}
      />,
    )

    expect(screen.getByText('All set')).toBeInTheDocument()
    expect(screen.queryByText(/to improve/)).not.toBeInTheDocument()
  })
})
