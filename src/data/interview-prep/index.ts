import { coreJavaTrack } from './tracks/core-java'
import { reactTrack } from './tracks/react'
import { springBootTrack } from './tracks/spring-boot'
import type { InterviewTrack } from './types'

export const INTERVIEW_TRACK_SLUGS = [
  'core-java',
  'react',
  'spring-boot',
] as const

export type InterviewTrackSlug = (typeof INTERVIEW_TRACK_SLUGS)[number]

const TRACKS: Record<InterviewTrackSlug, InterviewTrack> = {
  'core-java': coreJavaTrack,
  react: reactTrack,
  'spring-boot': springBootTrack,
}

export function getInterviewTrack(slug: string): InterviewTrack | undefined {
  if (!isInterviewTrackSlug(slug)) return undefined
  return TRACKS[slug]
}

export function isInterviewTrackSlug(
  slug: string,
): slug is InterviewTrackSlug {
  return (INTERVIEW_TRACK_SLUGS as readonly string[]).includes(slug)
}

export function listInterviewTracks(): InterviewTrack[] {
  return INTERVIEW_TRACK_SLUGS.map((s) => TRACKS[s])
}

export type { InterviewQuestion, InterviewTrack } from './types'
