import { describe, expect, it, vi } from 'vitest'

import { mapSupabaseStudentRowToProfile } from './mapSupabaseStudentRowToProfile'

const baseRow = {
  id: 'stu-1',
  name: 'Ada Lovelace',
  picture: 'https://example.com/ada.jpg',
  role: 'Engineer',
  email: 'ada@example.com',
}

describe('mapSupabaseStudentRowToProfile', () => {
  it('parses JSON columns and keeps already-parsed values', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    const profile = mapSupabaseStudentRowToProfile({
      ...baseRow,
      experience: '[{"company":"Acme","role":"Dev","summary":"Built compilers"}]',
      mentor_bridge_exp: { company: 'MentorBridge', role: 'Mentee', summary: 'Learned' },
      skill_sets: '["React","Node"]',
      inspirations: '{not-json',
      social_links: '{"linkedIn":"https://in.example","gitHub":""}',
      self_intro: 'Hello',
      serial_no: '12',
      resume_link: 'https://cv.example',
      medium_username: 'ada',
      cohort_id: 'cohort-1',
      batch: 4,
    })

    expect(profile.experience).toEqual([
      { company: 'Acme', role: 'Dev', summary: 'Built compilers' },
    ])
    expect(profile.mentorBridgeExp).toEqual({
      company: 'MentorBridge',
      role: 'Mentee',
      summary: 'Learned',
    })
    expect(profile.skillSets).toEqual(['React', 'Node'])
    expect(profile.inspirations).toEqual([])
    expect(profile.socialLinks).toEqual({
      linkedIn: 'https://in.example',
      gitHub: '',
    })
    expect(profile.selfIntro).toBe('Hello')
    expect(profile.serialNo).toBe(12)
    expect(profile.resumeLink).toBe('https://cv.example')
    expect(profile.mediumUsername).toBe('ada')
    expect(profile.cohortId).toBe('cohort-1')
    expect(profile.batch).toBe('4')
  })

  it('omits blank guardian fields and coerces invalid serial numbers to 0', () => {
    const profile = mapSupabaseStudentRowToProfile({
      ...baseRow,
      father_guardian_details: '  ',
      mother_details: null,
      serial_no: 'not-a-number',
      batch: null,
    })

    expect(profile.fatherGuardianDetails).toBeUndefined()
    expect(profile.motherDetails).toBeUndefined()
    expect(profile.serialNo).toBe(0)
    expect(profile.batch).toBe('')
    expect(profile.selfIntro).toBeUndefined()
  })

  it('keeps non-empty guardian details as strings', () => {
    const profile = mapSupabaseStudentRowToProfile({
      ...baseRow,
      father_guardian_details: 'Father',
      mother_details: 'Mother',
    })

    expect(profile.fatherGuardianDetails).toBe('Father')
    expect(profile.motherDetails).toBe('Mother')
  })
})
