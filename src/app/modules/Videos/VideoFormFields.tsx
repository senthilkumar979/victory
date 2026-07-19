'use client'

import { Controller, useWatch, type UseFormReturn } from 'react-hook-form'

import { FormInput } from '@/molecules/form-input/FormInput'
import { SESSION_VIDEO_CATEGORY_OPTIONS } from '@/lib/sessionVideos/sessionVideoCategories'
import type { SessionVideoFormValues } from '@/lib/sessionVideos/sessionVideoSchemas'
import { getYoutubeThumbnailUrl, parseYoutubeVideoId } from '@/lib/sessionVideos/youtubeUtils'
import { joinClassNames } from '@/utils/tailwindUtils'
import Image from 'next/image'

const selectBase =
  'block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

interface VideoFormFieldsProps {
  formId: string
  form: UseFormReturn<SessionVideoFormValues>
}

export const VideoFormFields = ({ formId, form }: VideoFormFieldsProps) => {
  const { control, register, formState } = form
  const { errors } = formState
  const youtubeUrl = useWatch({ control, name: 'youtubeUrl' })
  const videoId = parseYoutubeVideoId(youtubeUrl ?? '')

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
            placeholder="Session title"
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
      <Controller
        name="youtubeUrl"
        control={control}
        render={({ field }) => (
          <FormInput
            id={`${formId}-youtube-url`}
            label="YouTube Video URL"
            type="url"
            isDarkMode
            isRequired
            placeholder="https://www.youtube.com/watch?v=..."
            errorMessage={errors.youtubeUrl?.message}
            validationStatus={errors.youtubeUrl ? 'invalid' : 'default'}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {videoId && (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-slate-700">
          <Image
            src={getYoutubeThumbnailUrl(videoId)}
            alt="Video preview"
            fill
            className="object-cover"
          />
        </div>
      )}
      <div>
        <label
          htmlFor={`${formId}-category`}
          className="mb-1 block text-sm font-medium text-slate-200"
        >
          Category <span className="text-red-400">*</span>
        </label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <select
              id={`${formId}-category`}
              className={joinClassNames(
                selectBase,
                errors.category && 'border-red-500',
              )}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              ref={field.ref}
            >
              <option value="">Select category</option>
              {SESSION_VIDEO_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}
        />
        {errors.category?.message && (
          <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
        )}
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary focus:ring-primary"
          {...register('isFeatured')}
        />
        Featured video (shown in hero on browse page)
      </label>
    </div>
  )
}
