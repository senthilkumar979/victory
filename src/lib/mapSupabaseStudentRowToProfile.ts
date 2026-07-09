import type { ProfileData } from '@/types/student.types'
import { safeJsonParse } from '@/utils/parseUtils'

export function mapSupabaseStudentRowToProfile(
  data: Record<string, unknown>,
): ProfileData {
  const fatherGuardian = (data as { father_guardian_details?: string })
    .father_guardian_details
  const mother = (data as { mother_details?: string }).mother_details

  return {
    ...((data as unknown) as ProfileData),
    experience: safeJsonParse(data.experience, []),
    mentorBridgeExp: safeJsonParse(data.mentor_bridge_exp, {}),
    skillSets: safeJsonParse(data.skill_sets, []) as string[],
    inspirations: safeJsonParse(data.inspirations, []) as string[],
    socialLinks: safeJsonParse(data.social_links, {}),
    selfIntro: (data as { self_intro?: string }).self_intro ?? undefined,
    serialNo: Number((data as { serial_no?: number }).serial_no) || 0,
    resumeLink: (data as { resume_link?: string }).resume_link ?? undefined,
    mediumUsername:
      (data as { medium_username?: string }).medium_username ?? undefined,
    cohortId: (data as { cohort_id?: string }).cohort_id ?? undefined,
    batch: String((data as { batch?: unknown }).batch ?? ''),
    fatherGuardianDetails:
      fatherGuardian != null && String(fatherGuardian).trim()
        ? String(fatherGuardian)
        : undefined,
    motherDetails:
      mother != null && String(mother).trim() ? String(mother) : undefined,
  }
}
