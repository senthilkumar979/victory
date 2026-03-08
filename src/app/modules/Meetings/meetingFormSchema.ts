import { z } from 'zod'

export const meetingFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  googleGroupId: z.string().trim().min(1, 'Google Group is required'),
  date: z
    .string()
    .trim()
    .min(1, 'Date is required')
    .refine((val) => {
      const parsed = new Date(val)
      return !Number.isNaN(parsed.getTime()) && parsed.getTime() > Date.now()
    }, 'Date must be in the future'),
  description: z.string().trim().min(1, 'Description is required'),
  meetingLink: z.string().trim().optional().or(z.literal('')),
  coverImageUrl: z.string().trim().optional().or(z.literal('')),
})

export type MeetingFormValues = z.infer<typeof meetingFormSchema>
