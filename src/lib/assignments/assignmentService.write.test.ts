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

import {
  createAssignment,
  deleteAssignment,
  getAssignmentById,
  listAssignmentsForStudent,
  updateAssignment,
} from './assignmentService'

const assignmentRow = {
  id: 'assignment-1',
  title: 'Lab 1',
  description: 'Build the API',
  cohort_id: '11111111-1111-1111-1111-111111111111',
  category: 'Backend',
  google_group_id: 'group-1',
  attachments: 'https://example.com/spec.pdf',
  due_date: '2026-07-20T00:00:00.000Z',
  created_by: 'admin@example.com',
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-02T00:00:00.000Z',
  cohorts: { name: 'TS Batch 1' },
}

const mappedAssignment = {
  id: 'assignment-1',
  title: 'Lab 1',
  description: 'Build the API',
  cohortId: '11111111-1111-1111-1111-111111111111',
  cohortName: 'TS Batch 1',
  category: 'Backend',
  googleGroupId: 'group-1',
  attachments: 'https://example.com/spec.pdf',
  dueDate: '2026-07-20T00:00:00.000Z',
  createdBy: 'admin@example.com',
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-02T00:00:00.000Z',
}

describe('assignmentService assignment CRUD', () => {
  beforeEach(() => {
    supabaseAdminState.client = null
  })

  it('throws when the server database is not configured', async () => {
    await expect(getAssignmentById('assignment-1')).rejects.toThrow(
      'Server database is not configured.',
    )
  })

  it('maps getAssignmentById rows including nested cohort name', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: assignmentRow,
      error: null,
    })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })
    supabaseAdminState.client = { from }

    await expect(getAssignmentById('assignment-1')).resolves.toEqual(
      mappedAssignment,
    )
    expect(from).toHaveBeenCalledWith('assignments')
    expect(select).toHaveBeenCalledWith('*, cohorts(name)')
    expect(eq).toHaveBeenCalledWith('id', 'assignment-1')
  })

  it('returns null from getAssignmentById when no row exists', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    const eq = vi.fn().mockReturnValue({ maybeSingle })
    const select = vi.fn().mockReturnValue({ eq })
    supabaseAdminState.client = { from: vi.fn().mockReturnValue({ select }) }

    await expect(getAssignmentById('missing')).resolves.toBeNull()
  })

  it('lists assignments for a student cohort newest-due first', async () => {
    const order = vi.fn().mockResolvedValue({
      data: [assignmentRow],
      error: null,
    })
    const eq = vi.fn().mockReturnValue({ order })
    const select = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ select })
    supabaseAdminState.client = { from }

    await expect(
      listAssignmentsForStudent('11111111-1111-1111-1111-111111111111'),
    ).resolves.toEqual([mappedAssignment])
    expect(eq).toHaveBeenCalledWith(
      'cohort_id',
      '11111111-1111-1111-1111-111111111111',
    )
    expect(order).toHaveBeenCalledWith('due_date', { ascending: false })
  })

  it('creates an assignment and stores empty attachments as null', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...assignmentRow, attachments: null },
      error: null,
    })
    const select = vi.fn().mockReturnValue({ single })
    const insert = vi.fn().mockReturnValue({ select })
    const from = vi.fn().mockReturnValue({ insert })
    supabaseAdminState.client = { from }

    const created = await createAssignment({
      title: 'Lab 1',
      description: 'Build the API',
      cohortId: '11111111-1111-1111-1111-111111111111',
      category: 'Backend',
      googleGroupId: 'group-1',
      attachments: '',
      dueDate: '2026-07-20T00:00:00.000Z',
      createdBy: 'admin@example.com',
    })

    expect(insert).toHaveBeenCalledWith({
      title: 'Lab 1',
      description: 'Build the API',
      cohort_id: '11111111-1111-1111-1111-111111111111',
      category: 'Backend',
      google_group_id: 'group-1',
      attachments: null,
      due_date: '2026-07-20T00:00:00.000Z',
      created_by: 'admin@example.com',
    })
    expect(created.attachments).toBeNull()
    expect(created.cohortName).toBe('TS Batch 1')
  })

  it('updates only provided fields and nulls empty attachments', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { ...assignmentRow, title: 'Lab 1b', attachments: null },
      error: null,
    })
    const select = vi.fn().mockReturnValue({ single })
    const eq = vi.fn().mockReturnValue({ select })
    const update = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ update })
    supabaseAdminState.client = { from }

    await updateAssignment('assignment-1', {
      title: 'Lab 1b',
      attachments: '',
    })

    expect(update).toHaveBeenCalledWith({
      title: 'Lab 1b',
      attachments: null,
    })
    expect(eq).toHaveBeenCalledWith('id', 'assignment-1')
  })

  it('deletes an assignment by id and surfaces database errors', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null })
    const del = vi.fn().mockReturnValue({ eq })
    const from = vi.fn().mockReturnValue({ delete: del })
    supabaseAdminState.client = { from }

    await deleteAssignment('assignment-1')
    expect(from).toHaveBeenCalledWith('assignments')
    expect(eq).toHaveBeenCalledWith('id', 'assignment-1')

    eq.mockResolvedValueOnce({ error: { message: 'fk violation' } })
    await expect(deleteAssignment('assignment-1')).rejects.toEqual({
      message: 'fk violation',
    })
  })
})
