'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { useGoogleGroups } from '@/hooks/useGoogleGroups'
import { CalendarInput } from '@/molecules/calendar'
import { FormInput } from '@/molecules/form-input/FormInput'
import { joinClassNames } from '@/utils/tailwindUtils'

import type { MeetingFormValues } from './meetingFormSchema'

interface MeetingFormFieldsProps {
  formId: string
  form: UseFormReturn<MeetingFormValues>
}

const selectBase =
  'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0.25'

export const MeetingFormFields = ({
  formId,
  form,
}: MeetingFormFieldsProps) => {
  const { register, control, formState } = form
  const { errors } = formState
  const { groups, isLoading, error } = useGoogleGroups()

  return (
    <div className="space-y-4">
      <FormInput
        id={`${formId}-title`}
        label="Title"
        type="text"
        isDarkMode
        isRequired
        placeholder="e.g. Weekly sync"
        autoFocus
        errorMessage={errors.title?.message}
        validationStatus={errors.title ? 'invalid' : 'default'}
        {...register('title')}
      />
      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <div>
            <CalendarInput
              id={`${formId}-date`}
              label={"Date (Indian Standard Time, 24h)"}
              value={field.value}
              onChange={field.onChange}
              isDarkMode
              placeholder="Select date and time (IST)"
            />
            {errors.date && (
              <p className="mt-1 text-xs text-red-400">{errors.date.message}</p>
            )}
          </div>
        )}
      />
      <div>
        <FormLabel
          htmlFor={`${formId}-googleGroupId`}
          isDarkMode
          isRequired
          className="mb-1.5 block"
        >
          Google Group
        </FormLabel>
        <select
          id={`${formId}-googleGroupId`}
          disabled={isLoading}
          className={joinClassNames(
            selectBase,
            'border-slate-600 bg-slate-800 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60',
            errors.googleGroupId && 'border-red-500',
          )}
          aria-invalid={Boolean(errors.googleGroupId || error)}
          aria-describedby={
            errors.googleGroupId || error
              ? `${formId}-googleGroupId-error`
              : undefined
          }
          {...register('googleGroupId')}
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group.id ?? group.email} value={group.email}>
              {group.name} | ({group.email})
            </option>
          ))}
        </select>
        {(errors.googleGroupId || error) && (
          <p
            id={`${formId}-googleGroupId-error`}
            className="mt-1 text-xs text-red-400"
          >
            {errors.googleGroupId?.message ?? error}
          </p>
        )}
      </div>
      <div>
        <FormLabel
          htmlFor={`${formId}-description`}
          isDarkMode
          isRequired
          className="mb-1.5 block"
        >
          Description
        </FormLabel>
        <div className="pl-1">
        <textarea
          id={`${formId}-description`}
          placeholder="Meeting agenda and notes..."
          className={joinClassNames(
            'w-full h-40 resize-none p-3 rounded-md mt-2 border',
            'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500',
            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0.25',
            errors.description && 'border-red-500',
          )}
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
          />
          </div>
        {errors.description && (
          <p className="mt-1 text-xs text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>
      <FormInput
        id={`${formId}-meetingLink`}
        label="Meeting link"
        type="url"
        isDarkMode
        placeholder="https://meet.google.com/..."
        {...register('meetingLink')}
      />
      <FormInput
        id={`${formId}-coverImageUrl`}
        label="Cover image URL"
        type="url"
        isDarkMode
        placeholder="https://..."
        {...register('coverImageUrl')}
      />
    </div>
  )
}
