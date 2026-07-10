import { z } from 'zod'

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || z.url().safeParse(v).success, 'Enter a valid URL')

export const googleDocUrlSchema = z
  .string()
  .trim()
  .min(1, 'Google Doc URL is required')
  .refine(
    (v) => /docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/.test(v),
    'Enter a valid Google Docs URL',
  )

export const githubRepoUrlSchema = z
  .string()
  .trim()
  .min(1, 'GitHub repository URL is required')
  .refine(
    (v) => /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(v),
    'Enter a valid GitHub repository URL (github.com/owner/repo)',
  )

export const assignmentFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  cohortId: z.string().uuid('Select a cohort'),
  googleGroupId: z.string().trim().min(1, 'Select a Google Group'),
  attachments: optionalUrl,
  dueDate: z
    .string()
    .trim()
    .min(1, 'Due date is required')
    .refine((val) => !Number.isNaN(new Date(val).getTime()), 'Invalid date'),
})

export const submissionFormSchema = z.object({
  googleDocUrl: googleDocUrlSchema,
  githubRepoUrl: githubRepoUrlSchema,
})

export type AssignmentFormValues = z.infer<typeof assignmentFormSchema>
export type SubmissionFormValues = z.infer<typeof submissionFormSchema>

const ratingRefine = (value: number) => {
  if (!Number.isFinite(value) || value < 1 || value > 5) return false
  const scaled = Math.round(value * 10)
  return Math.abs(value * 10 - scaled) < 0.001
}

export const submissionFeedbackSchema = z.object({
  rating: z
    .number({ message: 'Rating is required' })
    .refine(ratingRefine, 'Enter a rating between 1 and 5 (one decimal allowed)'),
  reviewedBy: z.string().trim().min(1, 'Reviewer name is required'),
  feedbackComment: z.string().trim().optional(),
})

export type SubmissionFeedbackFormValues = z.infer<typeof submissionFeedbackSchema>
