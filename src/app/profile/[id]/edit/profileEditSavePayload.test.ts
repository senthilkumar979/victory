import { describe, expect, it } from 'vitest'

import type { ProfileEditFormValues } from './profileEditFormSchema'
import { buildProfileSavePayload } from './profileEditSavePayload'

const memberOpts = {
  stagedPictureUrl: null as string | null,
  stagedResumeUrl: null as string | null,
  isAdmin: false,
}

function formValues(
  overrides: Partial<ProfileEditFormValues> = {},
): ProfileEditFormValues {
  return {
    name: 'Ada Lovelace',
    picture: 'https://cdn.example/old.png',
    role: 'Engineer',
    company: 'MentorBridge',
    summary: 'Builder',
    email: 'ada@example.com',
    mediumUsername: 'ada',
    cohortId: '11111111-1111-4111-8111-111111111111',
    gender: 'F',
    resumeLink: 'https://cdn.example/old.pdf',
    skillSets: 'React, TypeScript',
    inspirations: 'Grace Hopper,  ,',
    experience: [
      { company: 'Acme', role: 'Dev', summary: 'Shipped', website: '' },
      { company: '   ', role: '', summary: 'ignored', website: '' },
    ],
    mentorBridgeExp: { company: 'MentorBridge', role: 'Fellow', summary: '', website: '' },
    socialLinks: {
      linkedIn: '  https://linkedin.com/in/ada  ',
      gitHub: 'https://github.com/ada',
      website: '  ',
    },
    fatherGuardianDetails: 'Father',
    motherDetails: 'Mother',
    ...overrides,
  }
}

describe('buildProfileSavePayload', () => {
  it('prefers staged photo/resume URLs and omits blank optional fields', () => {
    const payload = buildProfileSavePayload(
      formValues({
        company: '',
        summary: '',
        mediumUsername: '',
        gender: '',
        skillSets: '  ,  ',
        inspirations: '',
      }),
      {
        stagedPictureUrl: ' https://blob.example/new.webp ',
        stagedResumeUrl: 'https://blob.example/new.pdf',
        isAdmin: false,
      },
    )

    expect(payload.picture).toBe('https://blob.example/new.webp')
    expect(payload.resumeLink).toBe('https://blob.example/new.pdf')
    expect(payload.company).toBeUndefined()
    expect(payload.summary).toBeUndefined()
    expect(payload.mediumUsername).toBeUndefined()
    expect(payload.gender).toBeUndefined()
    expect(payload.skillSets).toBeUndefined()
    expect(payload.inspirations).toBeUndefined()
  })

  it('falls back to form URLs and treats whitespace-only staged files as missing', () => {
    const fromForm = buildProfileSavePayload(formValues(), memberOpts)
    expect(fromForm.picture).toBe('https://cdn.example/old.png')
    expect(fromForm.resumeLink).toBe('https://cdn.example/old.pdf')

    const blankStaged = buildProfileSavePayload(
      formValues({ picture: '', resumeLink: '' }),
      { stagedPictureUrl: '   ', stagedResumeUrl: '  ', isAdmin: false },
    )
    expect(blankStaged.picture).toBeUndefined()
    expect(blankStaged.resumeLink).toBeUndefined()
  })

  it('drops empty comma tokens and experience rows without company or role', () => {
    const payload = buildProfileSavePayload(formValues(), memberOpts)
    expect(payload.skillSets).toEqual(['React', 'TypeScript'])
    expect(payload.inspirations).toEqual(['Grace Hopper'])
    expect(payload.experience).toEqual([
      { company: 'Acme', role: 'Dev', summary: 'Shipped', website: '' },
    ])
    expect(payload.mentorBridgeExp).toEqual({
      company: 'MentorBridge',
      role: 'Fellow',
      summary: '',
      website: '',
    })

    const emptyRows = buildProfileSavePayload(
      formValues({
        experience: [{ company: '', role: '  ', summary: 'x', website: '' }],
      }),
      memberOpts,
    )
    expect(emptyRows.experience).toBeUndefined()
  })

  it('trims social links and omits guardian fields unless the saver is an admin', () => {
    const member = buildProfileSavePayload(formValues(), memberOpts)
    expect(member.socialLinks).toEqual({
      linkedIn: 'https://linkedin.com/in/ada',
      gitHub: 'https://github.com/ada',
      website: '',
    })
    expect(member).not.toHaveProperty('fatherGuardianDetails')
    expect(member).not.toHaveProperty('motherDetails')

    const missingSocial = buildProfileSavePayload(
      formValues({ socialLinks: undefined }),
      memberOpts,
    )
    expect(missingSocial.socialLinks).toEqual({
      linkedIn: '',
      gitHub: '',
      website: '',
    })

    const admin = buildProfileSavePayload(
      formValues({ fatherGuardianDetails: '', motherDetails: '' }),
      { ...memberOpts, isAdmin: true },
    )
    expect(admin.fatherGuardianDetails).toBe('')
    expect(admin.motherDetails).toBe('')
  })
})
