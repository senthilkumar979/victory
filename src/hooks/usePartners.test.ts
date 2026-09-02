import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PartnerFormState } from '@/app/modules/Partners/Partner.types'

import { usePartners } from './usePartners'

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}))

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

function createListQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(),
    order: vi.fn(),
    then(onFulfilled: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(result).then(onFulfilled)
    },
  }
  query.select.mockReturnValue(query)
  query.order.mockReturnValue(query)
  return query
}

function createInsertQuery(result: { data: unknown; error: unknown }) {
  const query = {
    insert: vi.fn(),
    select: vi.fn(),
    single: vi.fn().mockResolvedValue(result),
  }
  query.insert.mockReturnValue(query)
  query.select.mockReturnValue(query)
  return query
}

const emptyPartner: Omit<PartnerFormState, 'id'> = {
  name: '  Acme  ',
  company: '  MentorBridge  ',
  location: '  Chennai  ',
  primaryEmail: '  ',
  primaryContact: '',
  secondaryEmail: '   ',
  secondaryContact: ' 555 ',
  designation: '',
  category: '  Gold  ',
  description: '  Partner org  ',
}

afterEach(() => {
  cleanup()
})

describe('usePartners', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
  })

  it('maps missing partner columns to empty strings', async () => {
    const listQuery = createListQuery({
      data: [{ id: 'p1', name: 'Acme' }],
      error: null,
    })
    fromMock.mockReturnValue(listQuery)

    const { result } = renderHook(() => usePartners())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(listQuery.select).toHaveBeenCalledWith(
      'id, name, company, location, primary_email, primary_contact, secondary_email, secondary_contact, designation, category, description',
    )
    expect(result.current.partners).toEqual([
      {
        id: 'p1',
        name: 'Acme',
        company: '',
        location: '',
        primaryEmail: '',
        primaryContact: '',
        secondaryEmail: '',
        secondaryContact: '',
        designation: '',
        category: '',
        description: '',
      },
    ])
  })

  it('trims required fields and stores blank optional contacts as null', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const insertQuery = createInsertQuery({ data: { id: 'p-new' }, error: null })
    fromMock
      .mockReturnValueOnce(listQuery)
      .mockReturnValueOnce(insertQuery)
      .mockReturnValue(listQuery)

    const { result } = renderHook(() => usePartners())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(result.current.createPartner(emptyPartner)).resolves.toEqual({
      id: 'p-new',
    })

    expect(insertQuery.insert).toHaveBeenCalledWith({
      name: 'Acme',
      company: 'MentorBridge',
      location: 'Chennai',
      primary_email: null,
      primary_contact: null,
      secondary_email: null,
      secondary_contact: '555',
      designation: null,
      category: 'Gold',
      description: 'Partner org',
    })
    expect(insertQuery.select).toHaveBeenCalledWith('id')
  })

  it('throws when create returns no id', async () => {
    const listQuery = createListQuery({ data: [], error: null })
    const insertQuery = createInsertQuery({ data: {}, error: null })
    fromMock.mockReturnValueOnce(listQuery).mockReturnValueOnce(insertQuery)

    const { result } = renderHook(() => usePartners())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await expect(result.current.createPartner(emptyPartner)).rejects.toThrow(
      'Partner created but no id returned',
    )
  })

  it('surfaces a Postgrest-style fetch error as the generic fallback', async () => {
    fromMock.mockReturnValue(
      createListQuery({ data: null, error: { message: 'timeout' } }),
    )

    const { result } = renderHook(() => usePartners())
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.error).toBe('Failed to fetch partners')
    expect(result.current.partners).toEqual([])
  })
})
