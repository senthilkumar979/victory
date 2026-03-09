'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { CalendarInput } from '@/molecules/calendar'
import { UserSearch } from '@/molecules/user-search/UserSearch'
import { joinClassNames } from '@/utils/tailwindUtils'

import type { PresenterFormValues } from './presenterFormSchema'

interface PresenterFormFieldsProps {
  formId: string
  form: UseFormReturn<PresenterFormValues>
}

export const PresenterFormFields = ({
  formId,
  form,
}: PresenterFormFieldsProps) => {
  const { register, control, formState } = form
  const { errors } = formState

  return (
    <div className="space-y-4">
      <Controller
        name="presentedBy"
        control={control}
        render={({ field }) => (
          <div>
            <FormLabel
              htmlFor={`${formId}-presentedBy`}
              isDarkMode
              isRequired
              className="mb-1.5 block"
            >
              Presented by
            </FormLabel>
            {field.value && (
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs text-slate-400">
                  Presenter: {field.value}
                </p>
                <button
                  type="button"
                  onClick={() => field.onChange('')}
                  className="text-xs text-primary hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
            <UserSearch
              placeholder="Search students by name..."
              onSelect={(student) => field.onChange(student.email)}
            />
            {errors.presentedBy && (
              <p className="mt-1 text-xs text-red-400">
                {errors.presentedBy.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="presentedDate"
        control={control}
        render={({ field }) => (
          <div className="pl-1">
            <CalendarInput
              id={`${formId}-presentedDate`}
              label="Presentation date"
              value={field.value}
              onChange={field.onChange}
              isDarkMode
              placeholder="Select date and time (IST)"
            />
            {errors.presentedDate && (
              <p className="mt-1 text-xs text-red-400">
                {errors.presentedDate.message}
              </p>
            )}
          </div>
        )}
      />
      <div>
        <FormLabel
          htmlFor={`${formId}-topic`}
          isDarkMode
          isRequired
          className="mb-1.5 block"
        >
          Topic
        </FormLabel>
        <div className="pl-1">
          <input
            id={`${formId}-topic`}
            type="text"
            placeholder="Presentation topic..."
            className={joinClassNames(
              'mt-2 block w-full rounded-md border px-3 py-2 text-sm',
              'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0.25',
              errors.topic && 'border-red-500',
            )}
            aria-invalid={Boolean(errors.topic)}
            {...register('topic')}
          />
        </div>
        {errors.topic && (
          <p className="mt-1 text-xs text-red-400">
            {errors.topic.message}
          </p>
        )}
      </div>
    </div>
  )
}
