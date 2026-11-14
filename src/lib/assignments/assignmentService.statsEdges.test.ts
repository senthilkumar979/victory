import { beforeEach, describe, expect, it, vi } from 'vitest'

const { supabaseAdminState } = vi.hoisted(() => ({
  supabaseAdminState: { client: null as unknown },
}))

vi.mock('server-only', () => ({}))

vi.mock('@/lib/supabaseAdmin', () => ({
  get supabaseAdmin() {
    return supabaseAdminState.client
  },
}))

import { getAssignmentStats } from './assignmentService'

function mockCounts(students: number | null, submissions: number | null) {
  const studentsEq = vi.fn().mockResolvedValue({
    count: students,
    error: null,
    data: null,
  })
  const submissionsEq = vi.fn().mockResolvedValue({
    count: submissions,
    error: null,
    data: null,
  })
  const studentsSelect = vi.fn().mockReturnValue({ eq: studentsEq })
  const submissionsSelect = vi.fn().mockReturnValue({ eq: submissionsEq })
  const from = vi.fn().mockImplementation((table: string) => {
    if (table === 'students') return { select: studentsSelect }
    if (table === 'assignment_submissions') return { select: submissionsSelect }
    throw new Error(`unexpected table ${table}`)
  })
  supabaseAdminState.client = { from }
  return { from, studentsSelect, studentsEq, submissionsSelect, submissionsEq }
}

describe('getAssignmentStats edges', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('throws when the server database is not configured', async () => {
    await expect(getAssignmentStats('assignment-1', 'cohort-1')).rejects.toThrow(
      'Server database is not configured.',
    )
  })

  it('counts the assignment cohort and rounds partial percentages', async () => {
    const mocks = mockCounts(3, 1)

    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toEqual({
      totalStudents: 3,
      submittedCount: 1,
      pendingCount: 2,
      submissionPercentage: 33,
    })
    expect(mocks.from).toHaveBeenCalledWith('students')
    expect(mocks.from).toHaveBeenCalledWith('assignment_submissions')
    expect(mocks.studentsSelect).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true,
    })
    expect(mocks.submissionsSelect).toHaveBeenCalledWith('id', {
      count: 'exact',
      head: true,
    })
    expect(mocks.studentsEq).toHaveBeenCalledWith('cohort_id', 'cohort-1')
    expect(mocks.submissionsEq).toHaveBeenCalledWith(
      'assignment_id',
      'assignment-1',
    )

    mockCounts(3, 2)
    await expect(
      getAssignmentStats('assignment-1', 'cohort-1'),
    ).resolves.toMatchObject({
      pendingCount: 1,
      submissionPercentage: 67,
    })
  })

  it('rounds a half percent up and a smaller fraction down to zero', async () => {
    mockCounts(200, 1)
    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toMatchObject(
      {
        pendingCount: 199,
        submissionPercentage: 1,
      },
    )

    mockCounts(300, 1)
    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toMatchObject(
      {
        pendingCount: 299,
        submissionPercentage: 0,
      },
    )
  })

  it('floors pending at zero when submissions exceed the cohort', async () => {
    mockCounts(5, 8)

    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toEqual({
      totalStudents: 5,
      submittedCount: 8,
      pendingCount: 0,
      submissionPercentage: 160,
    })
  })

  it('treats missing counts as zero and does not divide by an empty cohort', async () => {
    mockCounts(null, null)
    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toEqual({
      totalStudents: 0,
      submittedCount: 0,
      pendingCount: 0,
      submissionPercentage: 0,
    })

    mockCounts(null, 3)
    await expect(getAssignmentStats('assignment-1', 'cohort-1')).resolves.toEqual({
      totalStudents: 0,
      submittedCount: 3,
      pendingCount: 0,
      submissionPercentage: 0,
    })
  })
})
