import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AwardFormState } from './Award.types'
import { AdminAwards } from './AdminAwards'

const toast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))

const sendEmail = vi.hoisted(() => vi.fn())

const awardsState = {
  awards: [] as AwardFormState[],
  isLoading: false,
  error: null as string | null,
  refetch: vi.fn(),
}

const categoriesState = {
  categories: [] as { id?: string; name: string }[],
}

vi.mock('goey-toast', () => ({
  gooeyToast: toast,
}))

vi.mock('@/hooks/useAwards', () => ({
  useAwards: () => awardsState,
}))

vi.mock('@/hooks/useAwardCategories', () => ({
  useAwardCategories: () => categoriesState,
}))

vi.mock('./sendAwardWinnerNotificationEmail', () => ({
  sendAwardWinnerNotificationEmail: sendEmail,
}))

vi.mock('./AwardsHeader', () => ({
  AwardsHeader: () => <div>header</div>,
}))

vi.mock('./AwardsListStates', () => ({
  AwardsListStates: function AwardsListStatesMock({
    isLoading,
    error,
    isEmpty,
  }: {
    isLoading: boolean
    error: string | null
    isEmpty: boolean
  }) {
    if (isLoading) return <div>loading-awards</div>
    if (error) return <div>error-awards:{error}</div>
    if (isEmpty) return <div>empty-awards</div>
    return null
  },
}))

vi.mock('./AwardsTable', () => ({
  AwardsTable: function AwardsTableMock({
    awards,
    onEdit,
    onPublishToLinkedIn,
    onSendAwardEmail,
  }: {
    awards: AwardFormState[]
    onEdit: (award: AwardFormState) => void
    onPublishToLinkedIn: (award: AwardFormState) => void
    onSendAwardEmail: (award: AwardFormState) => void
  }) {
    return (
      <div>
        {awards.map((award) => {
          const key = award.id ?? 'noid'
          return (
            <div key={`${key}-${award.awardedTo}`}>
              <button type="button" onClick={() => onEdit(award)}>
                Edit {key}
              </button>
              <button type="button" onClick={() => onPublishToLinkedIn(award)}>
                Publish {key}
              </button>
              <button type="button" onClick={() => onSendAwardEmail(award)}>
                Email {key}
              </button>
            </div>
          )
        })}
      </div>
    )
  },
}))

vi.mock('./AwardFormDrawer', () => ({
  AwardFormDrawer: function AwardFormDrawerMock({
    isOpen,
    awardToEdit,
  }: {
    isOpen: boolean
    awardToEdit?: AwardFormState
  }) {
    if (!isOpen) return null
    return (
      <div>
        <span>editing:{awardToEdit?.awardedTo ?? 'create'}</span>
        <span>has-student:{awardToEdit?.student ? 'yes' : 'no'}</span>
      </div>
    )
  },
}))

vi.mock('./DeleteAward', () => ({
  DeleteAward: () => null,
}))

vi.mock('@/components/linkedin', () => ({
  AwardLinkedInPublishDrawer: function AwardLinkedInPublishDrawerMock({
    categoryName,
    companyDisplayName,
  }: {
    categoryName: string
    companyDisplayName: string
  }) {
    return (
      <div>
        linkedin:{categoryName || 'none'}:{companyDisplayName}
      </div>
    )
  },
}))

const baseAward: AwardFormState = {
  id: 'award-1',
  awardedTo: 'ada@mentorbridge.in',
  awardedOn: '2026-09-01',
  description: 'Outstanding work',
  awardCategoryId: 'cat-1',
  student: {
    name: '  Ada Lovelace  ',
    picture: '',
    batch: 2026,
  },
}

beforeEach(() => {
  awardsState.awards = []
  awardsState.isLoading = false
  awardsState.error = null
  awardsState.refetch.mockReset()
  categoriesState.categories = [
    { name: 'Unsaved' },
    { id: 'cat-1', name: 'Excellence' },
  ]
  sendEmail.mockReset()
  sendEmail.mockResolvedValue(undefined)
  toast.error.mockReset()
  toast.success.mockReset()
  delete process.env.NEXT_PUBLIC_LINKEDIN_COMPANY_NAME
})

afterEach(() => {
  cleanup()
})

describe('AdminAwards', () => {
  it('does not email or publish an award that has no id or a blank recipient', async () => {
    const user = userEvent.setup()
    awardsState.awards = [
      { ...baseAward, id: undefined },
      { ...baseAward, id: 'award-blank', awardedTo: '   ', student: undefined },
    ]

    render(<AdminAwards />)
    await user.click(screen.getByRole('button', { name: 'Email noid' }))
    await user.click(screen.getByRole('button', { name: 'Publish noid' }))
    await user.click(screen.getByRole('button', { name: 'Email award-blank' }))

    expect(sendEmail).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
    expect(screen.queryByText(/linkedin:/)).not.toBeInTheDocument()
  })

  it('emails the trimmed student name and mapped category', async () => {
    const user = userEvent.setup()
    awardsState.awards = [baseAward]

    render(<AdminAwards />)
    await user.click(screen.getByRole('button', { name: 'Email award-1' }))

    await waitFor(() =>
      expect(sendEmail).toHaveBeenCalledWith({
        recipientEmail: 'ada@mentorbridge.in',
        awardWinnerDisplayName: 'Ada Lovelace',
        awardCategoryName: 'Excellence',
      }),
    )
    expect(toast.success).toHaveBeenCalledWith(
      'Award notification email sent.',
      expect.objectContaining({ description: 'ada@mentorbridge.in' }),
    )
  })

  it('falls back to the email local-part, then the raw address, when the name is blank', async () => {
    const user = userEvent.setup()
    awardsState.awards = [
      {
        ...baseAward,
        id: 'award-local',
        awardCategoryId: 'missing',
        student: { name: '   ', picture: '', batch: 1 },
      },
      {
        ...baseAward,
        id: 'award-raw',
        awardedTo: '@mentorbridge.in',
        awardCategoryId: '',
        student: undefined,
      },
    ]

    render(<AdminAwards />)
    await user.click(screen.getByRole('button', { name: 'Email award-local' }))
    await user.click(screen.getByRole('button', { name: 'Email award-raw' }))

    await waitFor(() => expect(sendEmail).toHaveBeenCalledTimes(2))
    expect(sendEmail).toHaveBeenNthCalledWith(1, {
      recipientEmail: 'ada@mentorbridge.in',
      awardWinnerDisplayName: 'ada',
      awardCategoryName: '',
    })
    expect(sendEmail).toHaveBeenNthCalledWith(2, {
      recipientEmail: '@mentorbridge.in',
      awardWinnerDisplayName: '@mentorbridge.in',
      awardCategoryName: '',
    })
  })

  it('surfaces API and non-Error send failures', async () => {
    const user = userEvent.setup()
    awardsState.awards = [baseAward]
    sendEmail.mockRejectedValueOnce(new Error('Mailbox full'))

    const { rerender } = render(<AdminAwards />)
    await user.click(screen.getByRole('button', { name: 'Email award-1' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to send email.',
        expect.objectContaining({ description: 'Mailbox full' }),
      ),
    )

    sendEmail.mockRejectedValueOnce('down')
    rerender(<AdminAwards />)
    await user.click(screen.getByRole('button', { name: 'Email award-1' }))

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to send email.',
        expect.objectContaining({ description: 'Please try again.' }),
      ),
    )
  })

  it('opens LinkedIn only for a saved award and drops the student from the edit payload', async () => {
    const user = userEvent.setup()
    awardsState.awards = [baseAward]
    process.env.NEXT_PUBLIC_LINKEDIN_COMPANY_NAME = '   '

    render(<AdminAwards />)
    await user.click(screen.getByRole('button', { name: 'Publish award-1' }))
    expect(screen.getByText('linkedin:Excellence:MentorBridge')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit award-1' }))
    expect(screen.getByText('editing:ada@mentorbridge.in')).toBeInTheDocument()
    expect(screen.getByText('has-student:no')).toBeInTheDocument()
  })

  it('hides row actions while awards are loading or failed', () => {
    awardsState.isLoading = true
    awardsState.awards = [baseAward]
    const { rerender } = render(<AdminAwards />)

    expect(screen.getByText('loading-awards')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Email award-1' })).not.toBeInTheDocument()

    awardsState.isLoading = false
    awardsState.error = 'timeout'
    awardsState.awards = []
    rerender(<AdminAwards />)

    expect(screen.getByText('error-awards:timeout')).toBeInTheDocument()
    expect(screen.queryByText('empty-awards')).not.toBeInTheDocument()
  })
})
