import { Controller, type Control, type FieldErrors } from 'react-hook-form'

import { CalendarInput } from '@/molecules/calendar'

import type { MeetingFormValues } from './meetingFormSchema'

interface MeetingFormCalendarSectionProps {
  formId: string
  control: Control<MeetingFormValues>
  errors: FieldErrors<MeetingFormValues>
}

export const MeetingFormCalendarSection = ({
  formId,
  control,
  errors,
}: MeetingFormCalendarSectionProps) => (
  <Controller
    name="date"
    control={control}
    render={({ field }) => (
      <div>
        <CalendarInput
          id={`${formId}-date`}
          label={'Date (Indian Standard Time, 24h)'}
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
)
