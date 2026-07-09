/** Columns safe to load for student self-service (excludes admin-only fields). */
export const STUDENT_PUBLIC_SELECT =
  'id, name, picture, role, company, summary, email, medium_username, batch, cohort_id, gender, resume_link, skill_sets, inspirations, experience, mentor_bridge_exp, social_links, self_intro, serial_no'

export const STUDENT_ADMIN_EXTRA_SELECT =
  ', father_guardian_details, mother_details'

export function getStudentSelectColumns(includeAdminFields = false): string {
  return includeAdminFields
    ? `${STUDENT_PUBLIC_SELECT}${STUDENT_ADMIN_EXTRA_SELECT}`
    : STUDENT_PUBLIC_SELECT
}
