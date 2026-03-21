import { z } from 'zod'

export const contactFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  company: z.string().max(200),
  email: z.string().email('Enter a valid email'),
  message: z.string().min(1, 'Message is required').max(10000),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>
