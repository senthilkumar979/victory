import type { ProfileUpdatePayload } from '@/hooks/useUpdateStudent'

import type { ProfileEditFormValues } from './profileEditFormSchema'

export interface ProfileSavePayloadOptions {
  stagedPictureUrl: string | null
  stagedResumeUrl: string | null
  isAdmin: boolean
}

function parseCommaList(s: string | undefined): string[] {
  if (!s?.trim()) return []
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export function buildProfileSavePayload(
  data: ProfileEditFormValues,
  { stagedPictureUrl, stagedResumeUrl, isAdmin }: ProfileSavePayloadOptions,
): ProfileUpdatePayload {
  const skillSets = parseCommaList(data.skillSets)
  const inspirations = parseCommaList(data.inspirations)
  const socialLinks = {
    linkedIn: data.socialLinks?.linkedIn?.trim() ?? '',
    gitHub: data.socialLinks?.gitHub?.trim() ?? '',
    website: data.socialLinks?.website?.trim() ?? '',
  }

  const validExperience = data.experience.filter(
    (e) => e.company.trim() || e.role.trim(),
  )

  const pictureToSave = (stagedPictureUrl ?? data.picture)?.trim() || ''
  const resumeToSave = (stagedResumeUrl ?? data.resumeLink)?.trim() || ''

  return {
    name: data.name,
    picture: pictureToSave || undefined,
    role: data.role,
    company: data.company || undefined,
    summary: data.summary || undefined,
    email: data.email,
    mediumUsername: data.mediumUsername || undefined,
    cohortId: data.cohortId,
    gender: data.gender || undefined,
    resumeLink: resumeToSave || undefined,
    skillSets: skillSets.length > 0 ? skillSets : undefined,
    inspirations: inspirations.length > 0 ? inspirations : undefined,
    experience: validExperience.length ? validExperience : undefined,
    mentorBridgeExp: data.mentorBridgeExp,
    socialLinks,
    ...(isAdmin
      ? {
          fatherGuardianDetails: data.fatherGuardianDetails,
          motherDetails: data.motherDetails,
        }
      : {}),
  }
}
