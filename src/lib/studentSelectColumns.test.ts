import { describe, expect, it } from 'vitest'

import {
  getStudentSelectColumns,
  STUDENT_ADMIN_EXTRA_SELECT,
  STUDENT_PUBLIC_SELECT,
} from './studentSelectColumns'

describe('getStudentSelectColumns', () => {
  it('excludes guardian PII from the default student select list', () => {
    const columns = getStudentSelectColumns()

    expect(columns).toBe(STUDENT_PUBLIC_SELECT)
    expect(columns).not.toContain('father_guardian_details')
    expect(columns).not.toContain('mother_details')
    expect(columns).toContain('email')
    expect(columns).toContain('skill_sets')
  })

  it('appends admin-only guardian columns when requested', () => {
    expect(getStudentSelectColumns(true)).toBe(
      `${STUDENT_PUBLIC_SELECT}${STUDENT_ADMIN_EXTRA_SELECT}`,
    )
    expect(getStudentSelectColumns(true)).toContain('father_guardian_details')
    expect(getStudentSelectColumns(true)).toContain('mother_details')
  })
})
