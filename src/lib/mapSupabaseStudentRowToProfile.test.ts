import { afterEach, describe, expect, it, vi } from 'vitest'

import { mapSupabaseStudentRowToProfile } from '@/lib/mapSupabaseStudentRowToProfile'

describe('mapSupabaseStudentRowToProfile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('parses JSON fields and maps Supabase column names to profile fields', () => {
    const profile = mapSupabaseStudentRowToProfile({
      id: 'student-1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      experience: '[{"company":"Analytical Engines"}]',
      mentor_bridge_exp: '{"mentee":true}',
      skill_sets: '["TypeScript","React"]',
      inspirations: '["Grace Hopper"]',
      social_links: '{"linkedIn":"https://linkedin.example/ada"}',
      self_intro: 'Hello from Ada',
      serial_no: 17,
      resume_link: 'https://resume.example/ada.pdf',
      medium_username: 'ada',
    })

    expect(profile).toEqual(
      expect.objectContaining({
        experience: [{ company: 'Analytical Engines' }],
        mentorBridgeExp: { mentee: true },
        skillSets: ['TypeScript', 'React'],
        inspirations: ['Grace Hopper'],
        socialLinks: { linkedIn: 'https://linkedin.example/ada' },
        selfIntro: 'Hello from Ada',
        serialNo: 17,
        resumeLink: 'https://resume.example/ada.pdf',
        mediumUsername: 'ada',
      }),
    )
  })

  it('uses safe fallbacks for missing or malformed optional profile fields', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    const profile = mapSupabaseStudentRowToProfile({
      id: 'student-1',
      name: 'Ada Lovelace',
      skill_sets: 'not-json',
      social_links: '',
      serial_no: 'not-a-number',
    })

    expect(profile).toEqual(
      expect.objectContaining({
        experience: [],
        mentorBridgeExp: {},
        skillSets: [],
        inspirations: [],
        socialLinks: {},
        selfIntro: undefined,
        serialNo: 0,
        resumeLink: undefined,
        mediumUsername: undefined,
      }),
    )
  })
})
