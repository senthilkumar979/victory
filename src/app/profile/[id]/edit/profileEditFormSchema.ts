import { z } from 'zod'

const experienceItemSchema = z.object({
  company: z.string().trim(),
  role: z.string().trim(),
  summary: z.string().trim(),
  website: z.string().trim().optional().or(z.literal('')),
})

const mentorBridgeExpSchema = z.object({
  company: z.string().trim(),
  role: z.string().trim(),
  summary: z.string().trim(),
  website: z.string().trim().optional().or(z.literal('')),
})

const socialLinksSchema = z.object({
  linkedIn: z.string().trim().optional().or(z.literal('')),
  gitHub: z.string().trim().optional().or(z.literal('')),
  website: z.string().trim().optional().or(z.literal('')),
})

export const profileEditFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  picture: z.string().trim().optional().or(z.literal('')),
  role: z.string().trim().min(1, 'Role is required'),
  company: z.string().trim().optional().or(z.literal('')),
  summary: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Valid email is required'),
  mediumUsername: z.string().trim().optional().or(z.literal('')),
  batch: z.string().trim().min(1, 'Batch is required'),
  resumeLink: z.string().trim().optional().or(z.literal('')),
  skillSets: z.string().trim().optional().or(z.literal('')),
  inspirations: z.string().trim().optional().or(z.literal('')),
  experience: z.array(experienceItemSchema).optional(),
  mentorBridgeExp: mentorBridgeExpSchema.optional(),
  socialLinks: socialLinksSchema.optional(),
})

export type ProfileEditFormValues = z.infer<typeof profileEditFormSchema>
