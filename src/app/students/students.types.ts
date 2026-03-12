import type { ProfileData } from '@/types/student.types'

export interface StudentsFilterState {
  cohort: string
  company: string
  role: string
  nameSearch: string
}

export interface StudentsFilterOptions {
  cohorts: string[]
  companies: string[]
  roles: string[]
}

export interface UseStudentsWithFiltersReturn {
  students: ProfileData[]
  loading: boolean
  error: string | null
  filterOptions: StudentsFilterOptions
  filters: StudentsFilterState
  setFilters: React.Dispatch<React.SetStateAction<StudentsFilterState>>
  refetch: () => Promise<void>
}
