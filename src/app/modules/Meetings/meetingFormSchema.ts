import { z } from 'zod'

export const meetingFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  googleGroupId: z.string().trim().min(1, 'Google Group is required'),
  date: z
    .string()
    .trim()
    .min(1, 'Date and time are required')
    .refine((val) => {
      const parsed = new Date(val)
      return !Number.isNaN(parsed.getTime())
    }, 'Date and time must be valid'),
  description: z.string().trim().min(1, 'Description is required'),
  meetingLink: z.string().trim().optional().or(z.literal('')),
  coverImageUrl: z.string().trim().optional().or(z.literal('')),
})

export type MeetingFormValues = z.infer<typeof meetingFormSchema>
