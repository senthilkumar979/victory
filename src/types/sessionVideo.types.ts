import type { SessionVideoCategory } from '@/lib/sessionVideos/sessionVideoCategories'

export interface SessionVideo {
  id: string
  title: string
  youtubeUrl: string
  youtubeVideoId: string
  category: SessionVideoCategory
  isFeatured: boolean
  viewCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SessionVideoFormState {
  id?: string
  title: string
  youtubeUrl: string
  category: SessionVideoCategory
  isFeatured: boolean
}
