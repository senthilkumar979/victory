import { z } from 'zod'

import {
  SESSION_VIDEO_CATEGORIES,
  type SessionVideoCategory,
} from '@/lib/sessionVideos/sessionVideoCategories'
import { parseYoutubeVideoId } from '@/lib/sessionVideos/youtubeUtils'

const categoryValues = Object.values(SESSION_VIDEO_CATEGORIES) as [
  SessionVideoCategory,
  ...SessionVideoCategory[],
]

export const sessionVideoFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  youtubeUrl: z
    .string()
    .trim()
    .min(1, 'YouTube URL is required')
    .refine(
      (v) => parseYoutubeVideoId(v) !== null,
      'Enter a valid YouTube video URL',
    ),
  category: z.enum(categoryValues, { message: 'Select a category' }),
  isFeatured: z.boolean(),
})

export type SessionVideoFormValues = z.infer<typeof sessionVideoFormSchema>
