import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { MeetingFormState } from './Meeting.types'
import { MeetingsTable } from './MeetingsTable'

vi.mock('@/templates/CalendarDate', () => ({
  CalendarDate: ({ date }: { date: string }) => <time>{date}</time>,
}))

const baseMeeting: MeetingFormState = {
  id: 'mtg-1',
  title: 'Weekly standup',
  date: '2026-09-17T10:00:00.000Z',
  googleGroupId: '',
  description: 'Sync',
  meetingLink: '',
  coverImageUrl: '',
}

const handlers = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onAttendance: vi.fn(),
  onSendFeedbackEmail: vi.fn(),
  onCreateFeedbackForm: vi.fn(),
  openMeeting: vi.fn(),
  openFeedback: vi.fn(),
  onGenerateCoverImage: vi.fn(),
  onPublishToLinkedIn: vi.fn(),
}

function renderTable(
  meetings: MeetingFormState[],
  extra?: { sendingFeedbackEmailId?: string | null; creatingFeedbackFormId?: string | null },
) {
  return render(
    <MeetingsTable
      meetings={meetings}
      sendingFeedbackEmailId={extra?.sendingFeedbackEmailId ?? null}
      creatingFeedbackFormId={extra?.creatingFeedbackFormId ?? null}
      {...handlers}
    />,
  )
}

async function openActions(title: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: `Actions for ${title}` }))
  return user
}

beforeEach(() => {
  Object.values(handlers).forEach((fn) => fn.mockReset())
  HTMLElement.prototype.hasPointerCapture = vi.fn()
  HTMLElement.prototype.releasePointerCapture = vi.fn()
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
})

describe('MeetingsTable', () => {
  it('hides meeting-link and send-email actions until both the link and group exist', async () => {
    renderTable([baseMeeting])
    await openActions('Weekly standup')

    expect(
      screen.queryByRole('menuitem', { name: 'Open meeting link' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: 'Send feedback email' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'Create feedback form' }),
    ).toBeInTheDocument()
  })

  it('opens an existing feedback form instead of creating another', async () => {
    renderTable([
      {
        ...baseMeeting,
        feedbackForm: 'https://forms.gle/abc',
      },
    ])
    const user = await openActions('Weekly standup')

    expect(
      screen.queryByRole('menuitem', { name: 'Create feedback form' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Open feedback form' }))
    expect(handlers.openFeedback).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'mtg-1' }),
    )
    expect(handlers.onCreateFeedbackForm).not.toHaveBeenCalled()
  })

  it('sends feedback email only with a form and group, and resends after a prior send', async () => {
    const user = userEvent.setup()
    const firstSend: MeetingFormState = {
      ...baseMeeting,
      title: 'First send',
      googleGroupId: 'cohort@mentorbridge.in',
      feedbackForm: 'https://forms.gle/abc',
    }
    const resend: MeetingFormState = {
      ...firstSend,
      id: 'mtg-2',
      title: 'Resend later',
      feedbackEmailSentAt: '2026-09-01T00:00:00.000Z',
    }

    renderTable([firstSend, resend])

    await user.click(screen.getByRole('button', { name: 'Actions for First send' }))
    await user.click(screen.getByRole('menuitem', { name: 'Send feedback email' }))
    expect(handlers.onSendFeedbackEmail).toHaveBeenCalledWith(firstSend, false)

    await user.click(screen.getByRole('button', { name: 'Actions for Resend later' }))
    await user.click(
      screen.getByRole('menuitem', { name: 'Send feedback email again' }),
    )
    expect(handlers.onSendFeedbackEmail).toHaveBeenCalledWith(resend, true)
  })

  it('does not offer send-email when the google group is missing even if a form exists', async () => {
    renderTable([
      {
        ...baseMeeting,
        feedbackForm: 'https://forms.gle/abc',
        googleGroupId: '',
      },
    ])
    await openActions('Weekly standup')

    expect(
      screen.queryByRole('menuitem', { name: /Send feedback email/ }),
    ).not.toBeInTheDocument()
  })

  it('disables cover and LinkedIn actions when the meeting has no id', async () => {
    renderTable([
      {
        ...baseMeeting,
        id: undefined,
      },
    ])
    await openActions('Weekly standup')

    expect(
      screen.getByRole('menuitem', { name: 'Generate cover image' }),
    ).toHaveAttribute('data-disabled')
    expect(
      screen.getByRole('menuitem', { name: 'Publish to LinkedIn' }),
    ).toHaveAttribute('data-disabled')
    expect(handlers.onGenerateCoverImage).not.toHaveBeenCalled()
    expect(handlers.onPublishToLinkedIn).not.toHaveBeenCalled()
  })

  it('opens the meeting link, marks attendance, and deletes from the menu', async () => {
    const meeting: MeetingFormState = {
      ...baseMeeting,
      meetingLink: 'https://meet.google.com/abc-defg-hij',
    }
    renderTable([meeting])
    const user = await openActions('Weekly standup')

    await user.click(screen.getByRole('menuitem', { name: 'Open meeting link' }))
    expect(handlers.openMeeting).toHaveBeenCalledWith(meeting)

    await user.click(screen.getByRole('button', { name: 'Actions for Weekly standup' }))
    await user.click(screen.getByRole('menuitem', { name: 'Mark attendance' }))
    expect(handlers.onAttendance).toHaveBeenCalledWith(meeting)

    await user.click(screen.getByRole('button', { name: 'Actions for Weekly standup' }))
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }))
    expect(handlers.onDelete).toHaveBeenCalledWith(meeting)
  })

  it('shows an em dash when the google group is empty', () => {
    renderTable([baseMeeting])
    const row = screen.getByText('Weekly standup').closest('tr')
    expect(row).toBeTruthy()
    expect(within(row as HTMLElement).getByText('—')).toBeInTheDocument()
  })
})
