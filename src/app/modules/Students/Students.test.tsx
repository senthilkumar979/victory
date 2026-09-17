import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ProfileData } from '@/types/student.types'
import { Students } from './Students'

const pushMock = vi.fn()

const hookState = {
  students: [] as ProfileData[],
  loading: false,
  error: null as string | null,
  refetch: vi.fn(),
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}))

vi.mock('@/hooks/useStudents', () => ({
  useStudents: () => hookState,
}))

vi.mock('@/templates/StudentBatch', () => ({
  StudentBatch: ({ batch }: { batch: number }) => (
    <span>batch-num:{batch}</span>
  ),
}))

vi.mock('@/templates/StudentRole', () => ({
  StudentRole: ({ role }: { role: string }) => <span>{role}</span>,
}))

vi.mock('@/templates/SocialLinks', () => ({
  SocialLinks: () => <span>social-links</span>,
}))

function InviteStudentMock({
  show,
  onSuccess,
}: {
  show: boolean
  onSuccess?: () => void
}) {
  if (!show) return null
  return (
    <div>
      <p>invite-open</p>
      <button type="button" onClick={() => onSuccess?.()}>
        Invite sent
      </button>
    </div>
  )
}

vi.mock('./InviteStudent', () => ({
  InviteStudent: InviteStudentMock,
}))

const student: ProfileData = {
  id: 'stu-1',
  name: 'ada lovelace',
  picture: '',
  role: 'Backend Engineer',
  company: 'MentorBridge',
  email: 'ada@mentorbridge.in',
  batch: '2026',
  socialLinks: {
    linkedIn: 'https://linkedin.com/in/ada',
    gitHub: 'https://github.com/ada',
  },
}

beforeEach(() => {
  hookState.students = []
  hookState.loading = false
  hookState.error = null
  hookState.refetch.mockReset()
  pushMock.mockReset()
})

afterEach(() => {
  cleanup()
})

describe('Students', () => {
  it('shows loading, error, and empty states without the table', () => {
    hookState.loading = true
    const { rerender } = render(<Students />)
    expect(screen.getByText('Loading students …')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()

    hookState.loading = false
    hookState.error = 'timeout'
    rerender(<Students />)
    expect(screen.getByText(/Failed to load students/)).toHaveTextContent(
      'timeout',
    )
    expect(screen.queryByText('No students found.')).not.toBeInTheDocument()

    hookState.error = null
    rerender(<Students />)
    expect(screen.getByText('No students found.')).toBeInTheDocument()
  })

  it('navigates to the admin student page from row click or Enter', async () => {
    const user = userEvent.setup()
    hookState.students = [student]
    render(<Students />)

    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('ada lovelace')).toBeInTheDocument()

    await user.click(screen.getByText('ada lovelace'))
    expect(pushMock).toHaveBeenCalledWith('/secured/admin/student/stu-1')

    pushMock.mockReset()
    const row = screen.getByText('ada lovelace').closest('tr')
    expect(row).toHaveAttribute('role', 'button')
    ;(row as HTMLElement).focus()
    await user.keyboard('{Enter}')
    expect(pushMock).toHaveBeenCalledWith('/secured/admin/student/stu-1')
  })

  it('does not navigate when the mailto link is clicked', async () => {
    const user = userEvent.setup()
    hookState.students = [student]
    render(<Students />)

    const mail = screen.getByRole('link', { name: 'ada@mentorbridge.in' })
    expect(mail).toHaveAttribute('href', 'mailto:ada@mentorbridge.in')

    await user.click(mail)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('opens invite and refetches after a successful send', async () => {
    const user = userEvent.setup()
    hookState.students = [student]
    render(<Students />)

    await user.click(screen.getByRole('button', { name: 'Invite Student' }))
    expect(screen.getByText('invite-open')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Invite sent' }))
    expect(hookState.refetch).toHaveBeenCalled()
  })

  it('keeps social links from triggering row navigation', async () => {
    const user = userEvent.setup()
    hookState.students = [student]
    render(<Students />)

    const socialCell = screen.getByText('social-links').closest('td')
    expect(socialCell).toBeTruthy()
    await user.click(within(socialCell as HTMLElement).getByText('social-links'))
    expect(pushMock).not.toHaveBeenCalled()
  })
})
