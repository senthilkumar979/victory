import { z } from 'zod'

/** Coerce missing API/RHF values to '' then trim (avoids "expected string, received undefined"). */
const trimmed = z
  .string()
  .default('')
  .transform((s) => s.trim())

const trimmedRequired = (message: string) =>
  trimmed.pipe(z.string().min(1, message))

const emailField = trimmed.pipe(
  z.string().min(1, 'Email is required').email('Enter a valid email address'),
)

const genderField = z
  .string()
  .default('')
  .transform((s) => s.trim().toUpperCase())
  .refine((v) => v === '' || v === 'M' || v === 'F', {
    message: 'Choose Male, Female, or leave gender blank',
  })

const experienceItemSchema = z.object({
  company: trimmed,
  role: trimmed,
  summary: trimmed,
  website: trimmed,
})

const mentorBridgeExpSchema = z.object({
  company: trimmed,
  role: trimmed,
  summary: trimmed,
  website: trimmed,
})

const socialLinksSchema = z.object({
  linkedIn: trimmed,
  gitHub: trimmed,
  website: trimmed,
})

export const profileEditFormSchema = z.object({
  name: trimmedRequired('Full name is required'),
  picture: trimmed,
  role: trimmedRequired('Please select your role or title'),
  company: trimmed,
  summary: trimmed,
  email: emailField,
  mediumUsername: trimmed,
  batch: trimmedRequired('Cohort batch is required'),
  gender: genderField,
  resumeLink: trimmed,
  skillSets: trimmed,
  inspirations: trimmed,
  experience: z.array(experienceItemSchema).default([]),
  mentorBridgeExp: mentorBridgeExpSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
})

export type ProfileEditFormValues = z.output<typeof profileEditFormSchema>
