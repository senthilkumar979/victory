'use client'

import { type UseFormReturn } from 'react-hook-form'

import { GoogleDocPreview } from '@/components/assignments/GoogleDocPreview'
import { GitHubRepoPreview } from '@/components/assignments/GitHubRepoPreview'
import { FormInput } from '@/molecules/form-input/FormInput'
import type { SubmissionFormValues } from '@/lib/assignments/assignmentSchemas'
import {
  hasValidGithubRepoUrl,
  hasValidGoogleDocUrl,
} from '@/lib/assignments/assignmentSchemas'

interface SubmissionFormFieldsProps {
  formId: string
  form: UseFormReturn<SubmissionFormValues>
  readOnly?: boolean
}

export const SubmissionFormFields = ({
  formId,
  form,
  readOnly = false,
}: SubmissionFormFieldsProps) => {
  const { register, watch, formState } = form
  const { errors } = formState
  const googleDocUrl = watch('googleDocUrl')
  const githubRepoUrl = watch('githubRepoUrl')

  const docValid = hasValidGoogleDocUrl(googleDocUrl)
  const repoValid = hasValidGithubRepoUrl(githubRepoUrl)

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Provide at least one link — Google Doc, GitHub repository, or both.
      </p>
      <div>
        <FormInput
          id={`${formId}-googleDoc`}
          label="Google Doc URL"
          isDarkMode
          disabled={readOnly}
          placeholder="https://docs.google.com/document/d/..."
          {...register('googleDocUrl')}
        />
        {errors.googleDocUrl && (
          <p className="mt-1 text-xs text-red-400">{errors.googleDocUrl.message}</p>
        )}
        {docValid && <GoogleDocPreview url={googleDocUrl} />}
      </div>

      <div>
        <FormInput
          id={`${formId}-github`}
          label="GitHub Repository URL"
          isDarkMode
          disabled={readOnly}
          placeholder="https://github.com/owner/repo"
          {...register('githubRepoUrl')}
        />
        {errors.githubRepoUrl && (
          <p className="mt-1 text-xs text-red-400">
            {errors.githubRepoUrl.message}
          </p>
        )}
        {repoValid && <GitHubRepoPreview repoUrl={githubRepoUrl} />}
      </div>
    </div>
  )
}
