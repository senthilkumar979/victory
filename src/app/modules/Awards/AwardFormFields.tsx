'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { useAwardCategories } from '@/hooks/useAwardCategories'
import { CalendarInput } from '@/molecules/calendar'
import { UserSearch } from '@/molecules/user-search/UserSearch'
import { joinClassNames } from '@/utils/tailwindUtils'

import type { AwardFormValues } from './awardFormSchema'

interface AwardFormFieldsProps {
  formId: string
  form: UseFormReturn<AwardFormValues>
}

const selectBase =
  'block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0.25'

export const AwardFormFields = ({
  formId,
  form,
}: AwardFormFieldsProps) => {
  const { register, control, formState } = form
  const { errors } = formState
  const { categories, isLoading, error } = useAwardCategories()

  return (
    <div className="space-y-4">
      <Controller
        name="awardedTo"
        control={control}
        render={({ field }) => (
          <div>
            <FormLabel
              htmlFor={`${formId}-awardedTo`}
              isDarkMode
              isRequired
              className="mb-1.5 block"
            >
              Awarded to
            </FormLabel>
            {field.value && (
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs text-slate-400">
                  Recipient: {field.value}
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
              onSelect={(student) => {
                field.onChange(student.email)
                form.setValue('awardedToName', student.name)
              }}
            />
            {errors.awardedTo && (
              <p className="mt-1 text-xs text-red-400">
                {errors.awardedTo.message}
              </p>
            )}
          </div>
        )}
      />
      <Controller
        name="awardedOn"
        control={control}
        render={({ field }) => (
          <div className="pl-1">
            <CalendarInput
              id={`${formId}-awardedOn`}
              label="Awarded on"
              value={field.value}
              onChange={field.onChange}
              isDarkMode
              placeholder="Select date and time (IST)"
            />
            {errors.awardedOn && (
              <p className="mt-1 text-xs text-red-400">
                {errors.awardedOn.message}
              </p>
            )}
          </div>
        )}
      />
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
          placeholder="Award description..."
          className={joinClassNames(
            'mt-2 h-40 w-full resize-none rounded-md border p-3',
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
      <div>
        <FormLabel
          htmlFor={`${formId}-awardCategoryId`}
          isDarkMode
          className="mb-1.5 block"
        >
          Award category
        </FormLabel>
        <div className="pl-1">
        <select
          id={`${formId}-awardCategoryId`}
          disabled={isLoading}
          className={joinClassNames(
            selectBase,
            'border-slate-600 bg-slate-800 text-slate-100 disabled:cursor-not-allowed disabled:opacity-60',
            errors.awardCategoryId && 'border-red-500',
          )}
          aria-invalid={Boolean(errors.awardCategoryId || error)}
          aria-describedby={
            errors.awardCategoryId || error
              ? `${formId}-awardCategoryId-error`
              : undefined
          }
          {...register('awardCategoryId')}
        >
          <option value="">Select a category</option>
          {categories
            .filter((c): c is typeof c & { id: string } => Boolean(c.id))
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          </div>
        {(errors.awardCategoryId || error) && (
          <p
            id={`${formId}-awardCategoryId-error`}
            className="mt-1 text-xs text-red-400"
          >
            {errors.awardCategoryId?.message ?? error}
          </p>
        )}
      </div>
    </div>
  )
}
