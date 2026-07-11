import { z } from 'zod'

import {
  ASSIGNMENT_CATEGORIES,
  type AssignmentCategory,
} from '@/lib/assignments/assignmentCategories'

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === '' || z.url().safeParse(v).success, 'Enter a valid URL')

export const optionalGoogleDocUrlSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /docs\.google\.com\/document\/d\/[a-zA-Z0-9_-]+/.test(v),
    'Enter a valid Google Docs URL',
  )

export const optionalGithubRepoUrlSchema = z
  .string()
  .trim()
  .refine(
    (v) =>
      v === '' ||
      /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(v),
    'Enter a valid GitHub repository URL (github.com/owner/repo)',
  )

export function hasValidGoogleDocUrl(value: string): boolean {
  return optionalGoogleDocUrlSchema.safeParse(value).success && value.trim() !== ''
}

export function hasValidGithubRepoUrl(value: string): boolean {
  return optionalGithubRepoUrlSchema.safeParse(value).success && value.trim() !== ''
}

export const assignmentFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  cohortId: z.string().uuid('Select a cohort'),
  category: z
    .string()
    .refine(
      (value): value is AssignmentCategory =>
        ASSIGNMENT_CATEGORIES.includes(value as AssignmentCategory),
      'Select a category',
    ),
  googleGroupId: z.string().trim().min(1, 'Select a Google Group'),
  attachments: optionalUrl,
  dueDate: z
    .string()
    .trim()
    .min(1, 'Due date is required')
    .refine((val) => !Number.isNaN(new Date(val).getTime()), 'Invalid date'),
})

const atLeastOneSubmissionUrlMessage =
  'Provide at least one URL — Google Doc or GitHub repository'

export const submissionFormSchema = z
  .object({
    googleDocUrl: optionalGoogleDocUrlSchema,
    githubRepoUrl: optionalGithubRepoUrlSchema,
  })
  .superRefine((data, ctx) => {
    if (data.googleDocUrl.trim() || data.githubRepoUrl.trim()) return

    ctx.addIssue({
      code: 'custom',
      message: atLeastOneSubmissionUrlMessage,
      path: ['googleDocUrl'],
    })
    ctx.addIssue({
      code: 'custom',
      message: atLeastOneSubmissionUrlMessage,
      path: ['githubRepoUrl'],
    })
  })

export type AssignmentFormValues = z.input<typeof assignmentFormSchema>
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
