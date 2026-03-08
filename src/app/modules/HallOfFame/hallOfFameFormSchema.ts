import { z } from 'zod'

export const hallOfFameFormSchema = z.object({
  studentEmail: z
    .string()
    .trim()
    .min(1, 'Student email is required')
    .email('Invalid email'),
  dateOfInduction: z
    .string()
    .trim()
    .min(1, 'Date of induction is required')
    .refine((val) => {
      const parsed = new Date(val)
      return !Number.isNaN(parsed.getTime())
    }, 'Invalid date'),
})

export type HallOfFameFormValues = z.infer<typeof hallOfFameFormSchema>
