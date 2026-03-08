'use client'

import { Controller, type UseFormReturn } from 'react-hook-form'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { CalendarInput } from '@/molecules/calendar'
import { UserSearch } from '@/molecules/user-search/UserSearch'

import type { HallOfFameFormValues } from './hallOfFameFormSchema'

interface HallOfFameFormFieldsProps {
  formId: string
  form: UseFormReturn<HallOfFameFormValues>
}

export const HallOfFameFormFields = ({
  formId,
  form,
}: HallOfFameFormFieldsProps) => {
  const { control, formState } = form
  const { errors } = formState

  return (
    <div className="space-y-4">
      <div>
        <FormLabel
          htmlFor={`${formId}-studentEmail`}
          isDarkMode
          isRequired
          className="mb-1.5 block"
        >
          Student email
        </FormLabel>
        <Controller
          name="studentEmail"
          control={control}
          render={({ field }) => (
            <UserSearch
              onSelect={(student) => field.onChange(student.email)}
              placeholder="Search students by name..."
              className={
                errors.studentEmail ? 'ring-2 ring-red-500 rounded-xl' : ''
              }
            />
          )}
        />
        {errors.studentEmail && (
          <p className="mt-1 text-xs text-red-400">
            {errors.studentEmail.message}
          </p>
        )}
      </div>
      <Controller
        name="dateOfInduction"
        control={control}
        render={({ field }) => (
          <div>
            <CalendarInput
              id={`${formId}-dateOfInduction`}
              label="Date of induction"
              value={field.value}
              onChange={field.onChange}
              isDarkMode
              placeholder="Select date and time (IST)"
            />
            {errors.dateOfInduction && (
              <p className="mt-1 text-xs text-red-400">
                {errors.dateOfInduction.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
