import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import type { ProfileData } from '@/types/student.types'
import type {
  StudentsFilterOptions,
  StudentsFilterState,
  UseStudentsWithFiltersReturn,
} from '@/app/students/students.types'

const safeJsonParse = (value: unknown, fallback: unknown = null) => {
  if (!value) return fallback
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return fallback
    }
  }
  return fallback
}

const extractFilterOptions = (
  data: { batch: string | number | null; company: string | null; role: string | null }[],
): StudentsFilterOptions => {
  const cohorts = [...new Set(data.map((r) => String(r.batch ?? '')).filter(Boolean))].sort(
    (a, b) => Number(b) - Number(a),
  )
  const companies = [...new Set(data.map((r) => r.company ?? '').filter(Boolean))].sort()
  const roles = [...new Set(data.map((r) => r.role ?? '').filter(Boolean))].sort()
  return { cohorts, companies, roles }
}

const SELECT_COLS = 'id, name, picture, role, company, email, social_links, batch'

export const useStudentsWithFilters = (): UseStudentsWithFiltersReturn => {
  const [students, setStudents] = useState<ProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterOptions, setFilterOptions] = useState<StudentsFilterOptions>({
    cohorts: [],
    companies: [],
    roles: [],
  })
  const [filters, setFilters] = useState<StudentsFilterState>({
    cohort: '',
    company: '',
    role: '',
    nameSearch: '',
  })

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('students')
        .select(SELECT_COLS)
        .order('batch', { ascending: false })
        .order('name', { ascending: true })

      if (filters.nameSearch.trim()) {
        query = query.ilike('name', `%${filters.nameSearch.trim()}%`)
      }
      if (filters.cohort) {
        query = query.eq('batch', filters.cohort)
      }
      if (filters.company) {
        query = query.eq('company', filters.company)
      }
      if (filters.role) {
        query = query.eq('role', filters.role)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      if (data) {
        const transformed: ProfileData[] = data.map((s) => ({
          id: s.id,
          name: s.name,
          picture: s.picture,
          role: s.role,
          company: s.company,
          email: s.email,
          socialLinks: safeJsonParse(s.social_links, {}),
          batch: s.batch,
        }))
        setStudents(transformed)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }, [filters.cohort, filters.company, filters.role, filters.nameSearch])

  const fetchFilterOptions = useCallback(async () => {
    const { data } = await supabase
      .from('students')
      .select('batch, company, role')
    if (data) setFilterOptions(extractFilterOptions(data))
  }, [])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  useEffect(() => {
    fetchFilterOptions()
  }, [fetchFilterOptions])

  return {
    students,
    loading,
    error,
    filterOptions,
    filters,
    setFilters,
    refetch: fetchStudents,
  }
}
