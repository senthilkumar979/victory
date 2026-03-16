import { z } from 'zod'

export const awardFormSchema = z.object({
  awardedTo: z.string().trim().min(1, 'Recipient email is required'),
  awardedToName: z.string().trim().optional(),
  awardedOn: z
    .string()
    .trim()
    .min(1, 'Award date is required')
    .refine((val) => {
      const parsed = new Date(val)
      return !Number.isNaN(parsed.getTime())
    }, 'Invalid date'),
  description: z.string().trim().min(1, 'Description is required'),
  awardCategoryId: z.string().trim().optional().or(z.literal('')),
})

export type AwardFormValues = z.infer<typeof awardFormSchema>
