import { PencilIcon, TrashIcon } from 'lucide-react'

import { TextButton } from '@/atoms/button/Button'

import { CalendarDate } from '@/templates/CalendarDate'
import type { MeetingFormState } from './Meeting.types'

interface MeetingsTableProps {
  meetings: MeetingFormState[]
  onEdit: (meeting: MeetingFormState) => void
  onDelete: (meeting: MeetingFormState) => void
}

export const MeetingsTable = ({
  meetings,
  onEdit,
  onDelete,
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
          <th className="max-w-xs px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            Preview
          </th>
          <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
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
            <td className="max-w-xs px-4 py-3 text-sm text-slate-700">
              <div
                className="line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html: meeting.description || '—',
                }}
              />
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
              <div className="flex items-center justify-end gap-2">
                <TextButton
                  variant="textTertiary"
                  onClick={() => onEdit(meeting)}
                >
                  <PencilIcon className="size-4" />
                </TextButton>
                <TextButton
                  variant="textError"
                  onClick={() => onDelete(meeting)}
                >
                  <TrashIcon className="size-4" />
                </TextButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
