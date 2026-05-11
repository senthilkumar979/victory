import { Controller, type Control, type FieldErrors } from 'react-hook-form'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { joinClassNames } from '@/utils/tailwindUtils'

import type { MeetingFormValues } from './meetingFormSchema'

const selectBase =
  'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0.25'

interface GoogleGroupRow {
  id?: string
  name: string
  email: string
}

interface MeetingFormGoogleGroupSectionProps {
  formId: string
  control: Control<MeetingFormValues>
  errors: FieldErrors<MeetingFormValues>
  groups: GoogleGroupRow[]
  isLoading: boolean
  directoryLoadError: string | null
  googleGroupIdWatch: string | undefined
  showOrphanGroupOption: boolean
}

export const MeetingFormGoogleGroupSection = ({
  formId,
  control,
  errors,
  groups,
  isLoading,
  directoryLoadError,
  googleGroupIdWatch,
  showOrphanGroupOption,
}: MeetingFormGoogleGroupSectionProps) => (
  <div>
    <FormLabel
      htmlFor={`${formId}-googleGroupId`}
      isDarkMode
      isRequired
      className="mb-1.5 block"
    >
      Google Group
    </FormLabel>
    <Controller
      name="googleGroupId"
      control={control}
      render={({ field }) => (
        <select
          id={`${formId}-googleGroupId`}
          disabled={isLoading}
          className={joinClassNames(
            selectBase,
            'border-slate-600 bg-slate-800 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60',
            errors.googleGroupId && 'border-red-500',
          )}
          aria-invalid={Boolean(errors.googleGroupId || directoryLoadError)}
          aria-describedby={
            errors.googleGroupId || directoryLoadError
              ? `${formId}-googleGroupId-error`
              : undefined
          }
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
          ref={field.ref}
        >
          <option value="">Select a group</option>
          {showOrphanGroupOption && googleGroupIdWatch ? (
            <option value={googleGroupIdWatch}>
              {googleGroupIdWatch} (not in directory)
            </option>
          ) : null}
          {groups.map((group) => (
            <option key={group.id ?? group.email} value={group.email}>
              {group.name} | ({group.email})
            </option>
          ))}
        </select>
      )}
    />
    {(errors.googleGroupId || directoryLoadError) && (
      <p
        id={`${formId}-googleGroupId-error`}
        className="mt-1 text-xs text-red-400"
      >
        {errors.googleGroupId?.message ?? directoryLoadError}
      </p>
    )}
  </div>
)
