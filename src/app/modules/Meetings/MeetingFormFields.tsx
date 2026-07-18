'use client'

import { useEffect } from 'react'
import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'

import { FormLabel } from '@/atoms/form-label/FormLabel'
import { useGoogleGroups } from '@/hooks/useGoogleGroups'
import { FormInput } from '@/molecules/form-input/FormInput'
import { joinClassNames } from '@/utils/tailwindUtils'

import { MeetingFormCalendarSection } from './MeetingFormCalendarSection'
import { MeetingFormCoverImageSection } from './MeetingFormCoverImageSection'
import { MeetingFormGoogleGroupSection } from './MeetingFormGoogleGroupSection'
import { MeetingFormLinksSection } from './MeetingFormLinksSection'
import type { MeetingFormValues } from './meetingFormSchema'

interface MeetingFormFieldsProps {
  formId: string
  form: UseFormReturn<MeetingFormValues>
  meetingId?: string
  stagedCoverFile: File | null
  onStagedCoverFileChange: (file: File | null) => void
}

export const MeetingFormFields = ({
  formId,
  form,
  meetingId,
  stagedCoverFile,
  onStagedCoverFileChange,
}: MeetingFormFieldsProps) => {
  const { control, formState, setValue } = form
  const { errors } = formState
  const coverImageUrl = useWatch({ control, name: 'coverImageUrl' }) ?? ''
  const { groups, isLoading, error: directoryLoadError } = useGoogleGroups()
  const googleGroupIdWatch = useWatch({ control, name: 'googleGroupId' })

  /** DB may store google_groups.id while the select uses group.email as value */
  useEffect(() => {
    const gid = googleGroupIdWatch
    if (!gid || groups.length === 0) return
    if (groups.some((g) => g.email === gid)) return
    const byId = groups.find((g) => g.id === gid)
    if (byId) {
      setValue('googleGroupId', byId.email, { shouldDirty: false })
    }
  }, [googleGroupIdWatch, groups, setValue])

  const showOrphanGroupOption =
    Boolean(googleGroupIdWatch) &&
    !isLoading &&
    !groups.some(
      (g) =>
        g.email === googleGroupIdWatch || g.id === googleGroupIdWatch,
    )

  return (
    <div className="space-y-4">
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
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
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <MeetingFormCalendarSection
        formId={formId}
        control={control}
        errors={errors}
      />
      <MeetingFormGoogleGroupSection
        formId={formId}
        control={control}
        errors={errors}
        groups={groups}
        isLoading={isLoading}
        directoryLoadError={directoryLoadError}
        googleGroupIdWatch={googleGroupIdWatch}
        showOrphanGroupOption={showOrphanGroupOption}
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
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                id={`${formId}-description`}
                placeholder="Meeting agenda and notes..."
                className={joinClassNames(
                  'mt-2 h-40 w-full resize-none rounded-md border p-3',
                  'border-slate-600 bg-slate-800 text-slate-100 placeholder:text-slate-500',
                  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:ring-offset-0.25',
                  errors.description && 'border-red-500',
                )}
                aria-invalid={Boolean(errors.description)}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
        </div>
        {errors.description && (
          <p className="mt-1 text-xs text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>
      <MeetingFormCoverImageSection
        formId={formId}
        meetingId={meetingId}
        coverImageUrl={coverImageUrl}
        onCoverImageUrlChange={(url) =>
          setValue('coverImageUrl', url, { shouldDirty: true })
        }
        stagedCoverFile={stagedCoverFile}
        onStagedCoverFileChange={onStagedCoverFileChange}
      />
      <MeetingFormLinksSection formId={formId} control={control} />
    </div>
  )
}
