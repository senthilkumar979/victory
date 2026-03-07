'use client'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { useGoogleGroups } from '@/hooks/useGoogleGroups'
import { CalendarInput } from '@/molecules/calendar'
import { FormInput } from '@/molecules/form-input/FormInput'
import { joinClassNames } from '@/utils/tailwindUtils'

import type { MeetingFormState } from './Meeting.types'

interface MeetingFormFieldsProps {
  formId: string
  formState: MeetingFormState
  onChange: <K extends keyof MeetingFormState>(
    field: K,
    value: MeetingFormState[K],
  ) => void
}

const selectBase =
  'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0.25'

export const MeetingFormFields = ({
  formId,
  formState,
  onChange,
}: MeetingFormFieldsProps) => {
  const { groups, isLoading, error } = useGoogleGroups()

  return (
    <div className="space-y-4">
      <FormInput
        id={`${formId}-title`}
        label="Title"
        type="text"
        isDarkMode
        placeholder="e.g. Weekly sync"
        autoFocus
        value={formState.title}
        onChange={(e) => onChange('title', e.target.value)}
      />
      <CalendarInput
        id={`${formId}-date`}
        label="Date"
        value={formState.date}
        onChange={(dateStr) => onChange('date', dateStr)}
        isDarkMode
        placeholder="Select meeting date"
      />
      <div>
        <FormLabel
          htmlFor={`${formId}-googleGroupId`}
          isDarkMode
          className="mb-1.5 block"
        >
          Google Group
        </FormLabel>
        <select
          id={`${formId}-googleGroupId`}
          value={formState.googleGroupId}
          onChange={(e) => onChange('googleGroupId', e.target.value)}
          disabled={isLoading}
          className={joinClassNames(
            selectBase,
            'border-slate-600 bg-slate-800 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60',
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${formId}-googleGroupId-error` : undefined}
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group.id ?? group.email} value={group.email}>
              {group.name} | ({group.email})
            </option>
          ))}
        </select>
        {error && (
          <p
            id={`${formId}-googleGroupId-error`}
            className="mt-1 text-xs text-red-400"
          >
            {error}
          </p>
        )}
      </div>
      <div>
        <FormLabel isDarkMode>Description</FormLabel>
        <textarea
          id={`${formId}-description`}
          placeholder="Meeting agenda and notes..."
          className="w-full h-40 resize-none p-3 rounded-md mt-2 border border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
          value={formState.description}
          onChange={(e) => onChange('description', e.target.value)}
        />
      </div>
      <FormInput
        id={`${formId}-meetingLink`}
        label="Meeting link"
        type="url"
        isDarkMode
        placeholder="https://meet.google.com/..."
        value={formState.meetingLink}
        onChange={(e) => onChange('meetingLink', e.target.value)}
      />
      <FormInput
        id={`${formId}-coverImageUrl`}
        label="Cover image URL"
        type="url"
        isDarkMode
        placeholder="https://..."
        value={formState.coverImageUrl}
        onChange={(e) => onChange('coverImageUrl', e.target.value)}
      />
    </div>
  )
}
