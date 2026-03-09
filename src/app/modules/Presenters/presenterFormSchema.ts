import { z } from 'zod'

export const presenterFormSchema = z.object({
  presentedBy: z.string().trim().min(1, 'Presenter is required'),
  presentedDate: z
    .string()
    .trim()
    .min(1, 'Presentation date is required')
    .refine((val) => {
      const parsed = new Date(val)
      return !Number.isNaN(parsed.getTime())
    }, 'Invalid date'),
  topic: z.string().trim().min(1, 'Topic is required'),
})

export type PresenterFormValues = z.infer<typeof presenterFormSchema>
