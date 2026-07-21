'use client'

import { useEffect } from 'react'
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'

import { MarkdownEditor } from '@/components/assignments/MarkdownEditor'
import { FormLabel } from '@/atoms/form-label/FormLabel'
import { CalendarInput } from '@/molecules/calendar'
import { FormInput } from '@/molecules/form-input/FormInput'
import { ASSIGNMENT_CATEGORY_OPTIONS } from '@/lib/assignments/assignmentCategories'
import type { AssignmentFormValues } from '@/lib/assignments/assignmentSchemas'
import type { Cohort } from '@/types/assignment.types'
import type { GoogleGroupFormState } from '@/app/modules/GoogleGroups/GoogleGroup.types'

const selectClassName =
  'mt-1 block w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-slate-100'

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
  const { register, control, formState, setValue } = form
  const { errors } = formState
  const googleGroupIdWatch = useWatch({ control, name: 'googleGroupId' })

  useEffect(() => {
    const gid = googleGroupIdWatch
    if (!gid || googleGroups.length === 0) return
    if (googleGroups.some((g) => g.email === gid)) return
    const byId = googleGroups.find((g) => g.id === gid)
    if (byId) {
      setValue('googleGroupId', byId.email, { shouldDirty: false })
    }
  }, [googleGroupIdWatch, googleGroups, setValue])

  const showOrphanGroupOption =
    Boolean(googleGroupIdWatch) &&
    !googleGroups.some(
      (g) => g.email === googleGroupIdWatch || g.id === googleGroupIdWatch,
    )

  return (
    <div className="space-y-4">
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <div>
            <FormInput
              id={`${formId}-title`}
              label="Title"
              isDarkMode
              isRequired
              placeholder="Assignment title"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>
        )}
      />

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <FormLabel htmlFor={`${formId}-cohort`} isDarkMode isRequired>
            Cohort
          </FormLabel>
          <select id={`${formId}-cohort`} className={selectClassName} {...register('cohortId')}>
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
          <FormLabel htmlFor={`${formId}-category`} isDarkMode isRequired>
            Category
          </FormLabel>
          <select id={`${formId}-category`} className={selectClassName} {...register('category')}>
            <option value="">Select category</option>
            {ASSIGNMENT_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-xs text-red-400">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <FormLabel htmlFor={`${formId}-group`} isDarkMode isRequired>
          Google Group
        </FormLabel>
        <select id={`${formId}-group`} className={selectClassName} {...register('googleGroupId')}>
          <option value="">Select group</option>
          {showOrphanGroupOption && googleGroupIdWatch ? (
            <option value={googleGroupIdWatch}>
              {googleGroupIdWatch} (not in directory)
            </option>
          ) : null}
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

      <Controller
        name="attachments"
        control={control}
        render={({ field }) => (
          <div>
            <FormInput
              id={`${formId}-attachments`}
              label="Attachments URL"
              isDarkMode
              placeholder="https://..."
              name={field.name}
              value={field.value ?? ''}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            {errors.attachments && (
              <p className="mt-1 text-xs text-red-400">{errors.attachments.message}</p>
            )}
          </div>
        )}
      />
    </div>
  )
}
