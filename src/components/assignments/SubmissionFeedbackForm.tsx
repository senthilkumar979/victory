'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { gooeyToast } from 'goey-toast'

import { Button } from '@/atoms/button/Button'
import { FormInput } from '@/molecules/form-input/FormInput'
import {
  submissionFeedbackSchema,
  type SubmissionFeedbackFormValues,
} from '@/lib/assignments/assignmentSchemas'
import type { AssignmentSubmission } from '@/types/assignment.types'
import { formatDueDate } from '@/lib/assignments/assignmentUtils'
import { SubmissionRatingDisplay } from './SubmissionRatingDisplay'

interface SubmissionFeedbackFormProps {
  assignmentId: string
  submission: AssignmentSubmission
  onSaved: (submission: AssignmentSubmission) => void
}

const toValues = (submission: AssignmentSubmission): SubmissionFeedbackFormValues => ({
  rating: submission.rating ?? 3,
  reviewedBy: submission.reviewedBy ?? '',
  feedbackComment: submission.feedbackComment ?? '',
})

export const SubmissionFeedbackForm = ({
  assignmentId,
  submission,
  onSaved,
}: SubmissionFeedbackFormProps) => {
  const form = useForm<SubmissionFeedbackFormValues>({
    resolver: zodResolver(submissionFeedbackSchema),
    defaultValues: toValues(submission),
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await fetch(
        `/api/assignments/${assignmentId}/submissions/${submission.id}/feedback`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        },
      )
      const body = await res.json()
      if (!res.ok) throw new Error(body.error ?? 'Failed to save feedback')

      gooeyToast.success('Feedback saved.', {
        description: 'The student has been notified by email.',
      })
      onSaved(body.submission)
    } catch (err) {
      gooeyToast.error('Failed to save feedback.', {
        description: err instanceof Error ? err.message : undefined,
      })
    }
  })

  const { control, register, formState, watch } = form
  const rating = watch('rating')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Controller
        name="rating"
        control={control}
        render={({ field }) => (
          <FormInput
            id="feedback-rating"
            label="Rating (1–5)"
            type="number"
            step="0.1"
            min={1}
            max={5}
            isDarkMode
            isRequired
            errorMessage={formState.errors.rating?.message}
            validationStatus={formState.errors.rating ? 'invalid' : 'default'}
            name={field.name}
            value={field.value}
            onChange={(e) => field.onChange(e.target.valueAsNumber)}
            onBlur={field.onBlur}
          />
        )}
      />
      {Number.isFinite(rating) && rating >= 1 && rating <= 5 && (
        <SubmissionRatingDisplay rating={rating} />
      )}
      <Controller
        name="reviewedBy"
        control={control}
        render={({ field }) => (
          <FormInput
            id="feedback-reviewed-by"
            label="Reviewer name"
            type="text"
            isDarkMode
            isRequired
            placeholder="Your name as shown to the student"
            errorMessage={formState.errors.reviewedBy?.message}
            validationStatus={formState.errors.reviewedBy ? 'invalid' : 'default'}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <div>
        <label htmlFor="feedback-comment" className="mb-1 block text-sm text-slate-200">
          Comment (optional)
        </label>
        <textarea
          id="feedback-comment"
          rows={4}
          className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
          placeholder="What went well? What can improve?"
          {...register('feedbackComment')}
        />
      </div>
      {submission.reviewedAt && (
        <p className="text-xs text-slate-500">
          Last saved {formatDueDate(submission.reviewedAt)}
          {submission.reviewedBy ? ` by ${submission.reviewedBy}` : ''}
        </p>
      )}
      <Button variant="primary" size="sm" type="submit" disabled={formState.isSubmitting}>
        Save feedback
      </Button>
    </form>
  )
}
