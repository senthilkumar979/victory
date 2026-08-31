import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useStudentGuardianDetails } from './useStudentGuardianDetails'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('useStudentGuardianDetails', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('does not fetch when disabled or when the student id is empty', () => {
    const { result, rerender } = renderHook(
      ({ studentId, enabled }) => useStudentGuardianDetails(studentId, enabled),
      { initialProps: { studentId: 'student-1', enabled: false } },
    )

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current).toBeUndefined()

    rerender({ studentId: '', enabled: true })

    expect(fetch).not.toHaveBeenCalled()
    expect(result.current).toBeUndefined()
  })

  it('maps missing guardian fields to empty strings', async () => {
    vi.mocked(fetch).mockResolvedValue({
      json: async () => ({ fatherGuardianDetails: 'Father', extra: true }),
    } as Response)

    const { result } = renderHook(() =>
      useStudentGuardianDetails('student-1', true),
    )

    await waitFor(() =>
      expect(result.current).toEqual({
        fatherGuardianDetails: 'Father',
        motherDetails: '',
      }),
    )
    expect(fetch).toHaveBeenCalledWith('/api/students/student-1/guardian-details')
  })

  it('returns null when the API reports an error or the request fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      json: async () => ({ error: 'Forbidden' }),
    } as Response)

    const { result, rerender } = renderHook(
      ({ studentId }) => useStudentGuardianDetails(studentId, true),
      { initialProps: { studentId: 'student-1' } },
    )

    await waitFor(() => expect(result.current).toBeNull())

    vi.mocked(fetch).mockRejectedValueOnce(new Error('network'))
    rerender({ studentId: 'student-2' })

    await waitFor(() => expect(result.current).toBeNull())
  })

  it('ignores a stale response after the student id changes', async () => {
    let resolveFirst: ((value: unknown) => void) | undefined
    vi.mocked(fetch)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          }) as Promise<Response>,
      )
      .mockResolvedValueOnce({
        json: async () => ({
          fatherGuardianDetails: 'Current',
          motherDetails: 'Now',
        }),
      } as Response)

    const { result, rerender } = renderHook(
      ({ studentId }) => useStudentGuardianDetails(studentId, true),
      { initialProps: { studentId: 'stale' } },
    )

    rerender({ studentId: 'current' })
    resolveFirst?.({
      json: async () => ({
        fatherGuardianDetails: 'Stale',
        motherDetails: 'Old',
      }),
    })

    await waitFor(() =>
      expect(result.current).toEqual({
        fatherGuardianDetails: 'Current',
        motherDetails: 'Now',
      }),
    )
    expect(result.current).not.toEqual({
      fatherGuardianDetails: 'Stale',
      motherDetails: 'Old',
    })
  })
})
