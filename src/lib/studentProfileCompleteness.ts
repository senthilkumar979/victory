import type { ProfileData } from '@/types/student.types'

/** Matches required fields on `profileEditFormSchema` (name, role, batch). */
export function isStudentProfileCompleteRow(row: {
  name?: unknown
  role?: unknown
  batch?: unknown
}): boolean {
  const name = String(row.name ?? '').trim()
  const role = String(row.role ?? '').trim()
  const batch = String(row.batch ?? '').trim()
  return name.length > 0 && role.length > 0 && batch.length > 0
}

export function isStudentProfileComplete(
  profile: ProfileData | null,
): boolean {
  if (!profile) return false
  return isStudentProfileCompleteRow({
    name: profile.name,
    role: profile.role,
    batch: profile.batch,
  })
}

export interface ProfileChecklistItem {
  id: string
  label: string
  done: boolean
}

export function getProfileChecklistItems(
  profile: ProfileData | null,
): ProfileChecklistItem[] {
  if (!profile) {
    return [{ id: 'load', label: 'Profile could not be loaded', done: false }]
  }
  const li = profile.socialLinks?.linkedIn?.trim()
  const gh = profile.socialLinks?.gitHub?.trim()
  return [
    { id: 'name', label: 'Full name', done: Boolean(profile.name?.trim()) },
    { id: 'role', label: 'Role / title', done: Boolean(profile.role?.trim()) },
    {
      id: 'batch',
      label: 'Cohort batch',
      done: Boolean(String(profile.batch ?? '').trim()),
    },
    {
      id: 'picture',
      label: 'Profile photo',
      done: Boolean(profile.picture?.trim()),
    },
    {
      id: 'summary',
      label: 'Short summary',
      done: Boolean(profile.summary?.trim()),
    },
    {
      id: 'resume',
      label: 'Resume link',
      done: Boolean(profile.resumeLink?.trim()),
    },
    {
      id: 'social',
      label: 'LinkedIn or GitHub',
      done: Boolean(li || gh),
    },
    {
      id: 'selfIntro',
      label: 'Self introduction',
      done: Boolean(profile.selfIntro?.trim()),
    },
  ]
}
