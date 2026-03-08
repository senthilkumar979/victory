import { z } from 'zod'

export const partnerFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    company: z.string().trim().min(1, 'Company is required'),
    location: z.string().trim().min(1, 'Location is required'),
    primaryEmail: z.string().trim().optional().or(z.literal('')),
    primaryContact: z.string().trim().optional().or(z.literal('')),
    secondaryEmail: z.string().trim().optional().or(z.literal('')),
    secondaryContact: z.string().trim().optional().or(z.literal('')),
    designation: z.string().trim().optional().or(z.literal('')),
    description: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (data) =>
      Boolean(data.primaryEmail?.trim()) || Boolean(data.primaryContact?.trim()),
    {
      message: 'Either primary email or primary contact is required',
      path: ['primaryEmail'],
    },
  )

export type PartnerFormValues = z.infer<typeof partnerFormSchema>
