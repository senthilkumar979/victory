import { describe, expect, it } from 'vitest'

import { buildStudentDescription } from './buildStudentDescription'

const baseStudent = {
  name: 'Ada',
  summary: null,
  role: null,
  company: null,
}

describe('buildStudentDescription', () => {
  it('uses a trimmed summary when it fits metadata limits', () => {
    expect(
      buildStudentDescription({
        ...baseStudent,
        summary: '  Building rural tech communities.  ',
      }),
    ).toBe('Building rural tech communities.')
  })

  it('truncates long summaries to 160 characters', () => {
    const description = buildStudentDescription({
      ...baseStudent,
      summary: 'a'.repeat(170),
    })

    expect(description).toHaveLength(158)
    expect(description).toBe(`${'a'.repeat(157)}…`)
  })

  it('falls back through role and company details', () => {
    expect(
      buildStudentDescription({
        ...baseStudent,
        role: 'Designer',
        company: 'MentorBridge',
      }),
    ).toBe(
      'Ada — Designer at MentorBridge. Part of the MentorBridge rural tech community.',
    )

    expect(buildStudentDescription({ ...baseStudent, role: 'Engineer' })).toBe(
      'Ada — Engineer. Part of the MentorBridge rural tech community.',
    )

    expect(buildStudentDescription(baseStudent)).toBe(
      'Ada — MentorBridge student. Part of the MentorBridge rural tech community.',
    )
  })
})
