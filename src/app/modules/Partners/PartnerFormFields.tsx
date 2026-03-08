'use client'

import { UseFormReturn } from 'react-hook-form'

import { FormInput } from '@/molecules/form-input/FormInput'

import type { PartnerFormValues } from './partnerFormSchema'

interface PartnerFormFieldsProps {
  formId: string
  form: UseFormReturn<PartnerFormValues>
}

export const PartnerFormFields = ({ formId, form }: PartnerFormFieldsProps) => {
  const { register, formState } = form
  const { errors } = formState

  return (
    <div className="space-y-4">
      <FormInput
        id={`${formId}-name`}
        label="Name"
        type="text"
        isDarkMode
        isRequired
        placeholder="Partner name"
        autoFocus
        errorMessage={errors.name?.message}
        validationStatus={errors.name ? 'invalid' : 'default'}
        {...register('name')}
      />
      <FormInput
        id={`${formId}-designation`}
        label="Designation"
        type="text"
        isDarkMode
        placeholder="e.g. CEO, Manager"
        {...register('designation')}
      />
      <FormInput
        id={`${formId}-company`}
        label="Company"
        type="text"
        isDarkMode
        isRequired
        placeholder="Company name"
        errorMessage={errors.company?.message}
        validationStatus={errors.company ? 'invalid' : 'default'}
        {...register('company')}
      />
      <FormInput
        id={`${formId}-location`}
        label="Location"
        type="text"
        isDarkMode
        isRequired
        placeholder="e.g. City, Country"
        errorMessage={errors.location?.message}
        validationStatus={errors.location ? 'invalid' : 'default'}
        {...register('location')}
      />
      <FormInput
        id={`${formId}-primaryEmail`}
        label="Primary email"
        type="email"
        isDarkMode
        placeholder="email@example.com"
        errorMessage={errors.primaryEmail?.message}
        validationStatus={errors.primaryEmail ? 'invalid' : 'default'}
        {...register('primaryEmail')}
      />
      <FormInput
        id={`${formId}-primaryContact`}
        label="Primary contact"
        type="text"
        isDarkMode
        placeholder="Phone or other contact"
        errorMessage={errors.primaryContact?.message}
        validationStatus={errors.primaryContact ? 'invalid' : 'default'}
        {...register('primaryContact')}
      />
      <FormInput
        id={`${formId}-secondaryEmail`}
        label="Secondary email"
        type="email"
        isDarkMode
        placeholder="email@example.com"
        {...register('secondaryEmail')}
      />
      <FormInput
        id={`${formId}-secondaryContact`}
        label="Secondary contact"
        type="text"
        isDarkMode
        placeholder="Phone or other contact"
        {...register('secondaryContact')}
      />
      <div>
        <label
          htmlFor={`${formId}-description`}
          className="mb-1.5 block text-sm font-medium text-slate-200"
        >
          Description
        </label>
        <textarea
          id={`${formId}-description`}
          placeholder="Partner description..."
          className="mt-2 h-32 w-full resize-none rounded-md border border-slate-600 bg-slate-800 p-3 text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0.25"
          aria-invalid={Boolean(errors.description)}
          {...register('description')}
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>
    </div>
  )
}
