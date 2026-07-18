import { Controller, type Control } from 'react-hook-form'

import { FormInput } from '@/molecules/form-input/FormInput'

import type { MeetingFormValues } from './meetingFormSchema'

interface MeetingFormLinksSectionProps {
  formId: string
  control: Control<MeetingFormValues>
}

export const MeetingFormLinksSection = ({
  formId,
  control,
}: MeetingFormLinksSectionProps) => (
  <Controller
    name="meetingLink"
    control={control}
    render={({ field }) => (
      <FormInput
        id={`${formId}-meetingLink`}
        label="Meeting link"
        type="url"
        isDarkMode
        placeholder="https://meet.google.com/..."
        name={field.name}
        value={field.value ?? ''}
        onChange={field.onChange}
        onBlur={field.onBlur}
      />
    )}
  />
)
