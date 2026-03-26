'use client'

import { DropdownMenu } from 'radix-ui'
import {
  ClipboardListIcon,
  FilePlus2Icon,
  LinkIcon,
  MailIcon,
  MessageCircleMoreIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from 'lucide-react'

import { CalendarDate } from '@/templates/CalendarDate'
import type { MeetingFormState } from './Meeting.types'

interface MeetingsTableProps {
  meetings: MeetingFormState[]
  onEdit: (meeting: MeetingFormState) => void
  onDelete: (meeting: MeetingFormState) => void
  onAttendance: (meeting: MeetingFormState) => void
  /** When `forceResend` is true, server allows another send after one was already recorded */
  onSendFeedbackEmail: (
    meeting: MeetingFormState,
    forceResend?: boolean,
  ) => void
  onCreateFeedbackForm: (meeting: MeetingFormState) => void
  openMeeting: (meeting: MeetingFormState) => void
  openFeedback: (meeting: MeetingFormState) => void
  sendingFeedbackEmailId?: string | null
  creatingFeedbackFormId?: string | null
}

const menuItemBase =
  'flex cursor-default select-none items-center gap-2 rounded-md px-2 py-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50'

const menuItemEdit = `${menuItemBase} text-secondary data-[highlighted]:bg-secondary/30 data-[highlighted]:text-secondary`
const menuItemLink = `${menuItemBase} text-sky-700 data-[highlighted]:bg-sky-50 data-[highlighted]:text-sky-900`
const menuItemCreateForm = `${menuItemBase} text-violet-700 data-[highlighted]:bg-violet-50 data-[highlighted]:text-violet-900`
const menuItemFeedback = `${menuItemBase} text-amber-700 data-[highlighted]:bg-amber-50 data-[highlighted]:text-amber-900`
const menuItemEmail = `${menuItemBase} text-teal-700 data-[highlighted]:bg-teal-50 data-[highlighted]:text-teal-900`
const menuItemAttendance = `${menuItemBase} text-info data-[highlighted]:bg-info/30 data-[highlighted]:text-info`
const menuItemDelete = `${menuItemBase} text-red-600 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700`

const menuContentClass =
  'z-50 min-w-[13rem] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg'

interface MeetingRowActionsProps {
  meeting: MeetingFormState
  onEdit: (meeting: MeetingFormState) => void
  onDelete: (meeting: MeetingFormState) => void
  onAttendance: (meeting: MeetingFormState) => void
  onSendFeedbackEmail: (
    meeting: MeetingFormState,
    forceResend?: boolean,
  ) => void
  onCreateFeedbackForm: (meeting: MeetingFormState) => void
  openMeeting: (meeting: MeetingFormState) => void
  openFeedback: (meeting: MeetingFormState) => void
  sendingFeedbackEmailId?: string | null
  creatingFeedbackFormId?: string | null
}

const MeetingRowActions = ({
  meeting,
  onEdit,
  onDelete,
  onAttendance,
  onSendFeedbackEmail,
  onCreateFeedbackForm,
  openMeeting,
  openFeedback,
  sendingFeedbackEmailId,
  creatingFeedbackFormId,
}: MeetingRowActionsProps) => {
  const canSendFeedbackEmail =
    Boolean(meeting.feedbackForm) && Boolean(meeting.googleGroupId)
  const isSendingFeedback = sendingFeedbackEmailId === meeting.id
  const isCreatingForm = creatingFeedbackFormId === meeting.id

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        type="button"
        className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1"
        aria-label={`Actions for ${meeting.title}`}
      >
        <MoreVerticalIcon className="size-4 shrink-0" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={menuContentClass}
          align="end"
          sideOffset={6}
        >
          <DropdownMenu.Item
            className={menuItemEdit}
            onSelect={() => onEdit(meeting)}
          >
            <PencilIcon className="size-4 shrink-0 text-secondary" />
            Edit
          </DropdownMenu.Item>
          {meeting.meetingLink ? (
            <DropdownMenu.Item
              className={menuItemLink}
              onSelect={() => openMeeting(meeting)}
            >
              <LinkIcon className="size-4 shrink-0 text-sky-600" />
              Open meeting link
            </DropdownMenu.Item>
          ) : null}
          {!meeting.feedbackForm ? (
            <DropdownMenu.Item
              className={menuItemCreateForm}
              disabled={isCreatingForm || !meeting.id}
              onSelect={() => onCreateFeedbackForm(meeting)}
            >
              <FilePlus2Icon className="size-4 shrink-0 text-violet-600" />
              {isCreatingForm ? 'Creating form…' : 'Create feedback form'}
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              className={menuItemFeedback}
              onSelect={() => openFeedback(meeting)}
            >
              <MessageCircleMoreIcon className="size-4 shrink-0 text-amber-600" />
              Open feedback form
            </DropdownMenu.Item>
          )}
          {canSendFeedbackEmail ? (
            <DropdownMenu.Item
              className={menuItemEmail}
              disabled={isSendingFeedback}
              onSelect={() =>
                onSendFeedbackEmail(
                  meeting,
                  Boolean(meeting.feedbackEmailSentAt),
                )
              }
            >
              <MailIcon className="size-4 shrink-0 text-teal-600" />
              {isSendingFeedback
                ? 'Sending…'
                : meeting.feedbackEmailSentAt
                ? 'Send feedback email again'
                : 'Send feedback email'}
            </DropdownMenu.Item>
          ) : null}
          <DropdownMenu.Item
            className={menuItemAttendance}
            onSelect={() => onAttendance(meeting)}
          >
            <ClipboardListIcon className="size-4 shrink-0 text-info" />
            Mark attendance
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-200" />
          <DropdownMenu.Item
            className={menuItemDelete}
            onSelect={() => onDelete(meeting)}
          >
            <TrashIcon className="size-4 shrink-0 text-red-600" />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export const MeetingsTable = ({
  meetings,
  onEdit,
  onDelete,
  onAttendance,
  onSendFeedbackEmail,
  onCreateFeedbackForm,
  openMeeting,
  openFeedback,
  sendingFeedbackEmailId,
  creatingFeedbackFormId,
}: MeetingsTableProps) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
    <table className="min-w-full divide-y divide-slate-200 bg-white">
      <thead className="bg-slate-50">
        <tr>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Title
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Date
          </th>
          <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Google Group
          </th>
          <th className="w-14 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {meetings.map((meeting) => (
          <tr key={meeting.id} className="hover:bg-slate-50/70">
            <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
              {meeting.title}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
              <CalendarDate date={meeting.date} />
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
              {meeting.googleGroupId || '—'}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right align-middle">
              <div className="flex justify-end">
                <MeetingRowActions
                  meeting={meeting}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onAttendance={onAttendance}
                  onSendFeedbackEmail={onSendFeedbackEmail}
                  onCreateFeedbackForm={onCreateFeedbackForm}
                  openMeeting={openMeeting}
                  openFeedback={openFeedback}
                  sendingFeedbackEmailId={sendingFeedbackEmailId}
                  creatingFeedbackFormId={creatingFeedbackFormId}
                />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
