'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { MarkdownEditor } from '@/components/assignments/MarkdownEditor'
import { FormLabel } from '@/atoms/form-label/FormLabel'
import { CalendarInput } from '@/molecules/calendar'
import { FormInput } from '@/molecules/form-input/FormInput'
import type { AssignmentFormValues } from '@/lib/assignments/assignmentSchemas'
import type { Cohort } from '@/types/assignment.types'
import type { GoogleGroupFormState } from '@/app/modules/GoogleGroups/GoogleGroup.types'

interface AssignmentFormFieldsProps {
  formId: string
  form: UseFormReturn<AssignmentFormValues>
  cohorts: Cohort[]
  googleGroups: GoogleGroupFormState[]
}

export const AssignmentFormFields = ({
  formId,
  form,
  cohorts,
  googleGroups,
}: AssignmentFormFieldsProps) => {
  const { register, control, formState } = form
  const { errors } = formState

  return (
    <div className="space-y-4">
      <div>
        <FormInput
          id={`${formId}-title`}
          label="Title"
          isDarkMode
          isRequired
          placeholder="Assignment title"
          {...register('title')}
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div>
        <FormLabel htmlFor={`${formId}-description`} isDarkMode isRequired>
          Description
        </FormLabel>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <MarkdownEditor
              id={`${formId}-description`}
              value={field.value}
              onChange={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
      </div>

      <div>
        <FormLabel htmlFor={`${formId}-cohort`} isDarkMode isRequired>
          Cohort
        </FormLabel>
        <select
          id={`${formId}-cohort`}
          className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          {...register('cohortId')}
        >
          <option value="">Select cohort</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.cohortId && (
          <p className="mt-1 text-xs text-red-400">{errors.cohortId.message}</p>
        )}
      </div>

      <div>
        <FormLabel htmlFor={`${formId}-group`} isDarkMode isRequired>
          Google Group
        </FormLabel>
        <select
          id={`${formId}-group`}
          className="mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100"
          {...register('googleGroupId')}
        >
          <option value="">Select group</option>
          {googleGroups.map((g) => (
            <option key={g.id ?? g.email} value={g.email}>
              {g.name} ({g.email})
            </option>
          ))}
        </select>
        {errors.googleGroupId && (
          <p className="mt-1 text-xs text-red-400">
            {errors.googleGroupId.message}
          </p>
        )}
      </div>

      <div>
        <FormInput
          id={`${formId}-attachments`}
          label="Attachments URL"
          isDarkMode
          placeholder="https://..."
          {...register('attachments')}
        />
        {errors.attachments && (
          <p className="mt-1 text-xs text-red-400">{errors.attachments.message}</p>
        )}
      </div>

      <Controller
        name="dueDate"
        control={control}
        render={({ field }) => (
          <div>
            <CalendarInput
              id={`${formId}-dueDate`}
              label="Due date"
              value={field.value}
              onChange={field.onChange}
              isDarkMode
              placeholder="Select date and time (IST)"
            />
            {errors.dueDate && (
              <p className="mt-1 text-xs text-red-400">{errors.dueDate.message}</p>
            )}
          </div>
        )}
      />
    </div>
  )
}
