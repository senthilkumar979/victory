import type { ProfileData } from '@/types/student.types'
import { safeJsonParse } from '@/utils/parseUtils'

export function mapSupabaseStudentRowToProfile(
  data: Record<string, unknown>,
): ProfileData {
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
  }
}
