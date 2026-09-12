import type { FieldErrors } from 'react-hook-form'

import type { ProfileData } from '@/types/student.types'

import type { ProfileEditFormValues } from './profileEditFormSchema'

export function toFormValues(student: ProfileData | null): ProfileEditFormValues {
  if (!student) {
    return {
      name: '',
      picture: '',
      role: '',
      company: '',
      summary: '',
      email: '',
      mediumUsername: '',
      cohortId: '',
      gender: '',
      resumeLink: '',
      skillSets: '',
      inspirations: '',
      experience: [],
      socialLinks: { linkedIn: '', gitHub: '', website: '' },
      fatherGuardianDetails: '',
      motherDetails: '',
    }
  }
  return {
    name: student.name ?? '',
    picture: student.picture ?? '',
    role: String(student.role ?? ''),
    company: student.company ?? '',
    summary: student.summary ?? '',
    email: student.email ?? '',
    mediumUsername: student.mediumUsername ?? '',
    cohortId: student.cohortId ?? '',
    gender: (() => {
      const g = student.gender?.trim()?.toUpperCase()
      return g === 'M' || g === 'F' ? g : ''
    })(),
    resumeLink: student.resumeLink ?? '',
    skillSets: student.skillSets?.join(', ') ?? '',
    inspirations: student.inspirations?.join(', ') ?? '',
    experience: (student.experience ?? []).map((e) => ({
      company: e.company ?? '',
      role: e.role ?? '',
      summary: e.summary ?? '',
      website: e.website ?? '',
    })),
    mentorBridgeExp: (() => {
      const m = student.mentorBridgeExp
      if (!m) return undefined
      return {
        company: m.company ?? '',
        role: m.role ?? '',
        summary: m.summary ?? '',
        website: m.website ?? '',
      }
    })(),
    socialLinks: {
      linkedIn: student.socialLinks?.linkedIn ?? '',
      gitHub: student.socialLinks?.gitHub ?? '',
      website: student.socialLinks?.website ?? '',
    },
    fatherGuardianDetails: student.fatherGuardianDetails ?? '',
    motherDetails: student.motherDetails ?? '',
  }
}

export function parseCommaList(s: string | undefined): string[] {
  if (!s?.trim()) return []
  return s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)
}

export function humanizeValidatorMessage(raw: string): string {
  const msg = raw.trim()
  if (/expected string,\s*received undefined/i.test(msg)) {
    return 'A field is empty or missing. Check all sections (including experience blocks) and try again.'
  }
  if (/expected string,\s*received null/i.test(msg)) {
    return 'A field has an invalid empty value. Please review the form and try again.'
  }
  return msg
}

export function collectFormErrorMessages(
  errors: FieldErrors<ProfileEditFormValues>,
): string[] {
  const out: string[] = []
  const walk = (node: unknown): void => {
    if (!node || typeof node !== 'object') return
    const n = node as Record<string, unknown>
    const msg = n.message
    if (typeof msg === 'string' && msg.trim())
      out.push(humanizeValidatorMessage(msg))
    for (const [key, val] of Object.entries(n)) {
      if (
        key === 'message' ||
        key === 'ref' ||
        key === 'type' ||
        key === 'types' ||
        key === 'root'
      )
        continue
      if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
          for (const item of val) walk(item)
        } else {
          walk(val)
        }
      }
    }
  }
  walk(errors)
  return [...new Set(out)]
}

export function getThrownMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message: unknown }).message
    if (typeof m === 'string' && m.trim()) return m
  }
  return 'Please try again.'
}
