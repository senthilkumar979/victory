export interface LinkedInGeneratedPost {
  title: string
  description: string
  hashtags: string[]
}

export type LinkedInPostVariant = 'default' | 'award'

export interface GenerateLinkedInPostInput {
  title: string
  description: string
  /** Extra context for Gemini (e.g. event date, audience) */
  context?: string
  /** Link included in the final commentary (meeting URL, article URL, etc.) */
  primaryLink: string
  /** Adjust tone and JSON schema hints (e.g. student award celebration) */
  variant?: LinkedInPostVariant
}

export interface PublishLinkedInPostInput {
  /** Full post text (commentary) including link and hashtags */
  commentary: string
  /** Public HTTPS URL of the image (PNG/JPG/GIF) */
  imageUrl: string
  /** Alt text for accessibility */
  imageAltText?: string
}
