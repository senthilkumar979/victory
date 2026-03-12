'use client'

import { Filter, X } from 'lucide-react'
import { useCallback, useState } from 'react'

import { TextButton } from '../../../ui/atoms/button/Button'
import type {
  StudentsFilterOptions,
  StudentsFilterState,
} from '../students.types'

interface StudentsFilterProps {
  filters: StudentsFilterState
  options: StudentsFilterOptions
  onFiltersChange: (filters: StudentsFilterState) => void
  disabled?: boolean
}

const selectBase =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50 transition'
const inputBase =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-50 placeholder:text-slate-400 transition'

export const StudentsFilter = ({
  filters,
  options,
  onFiltersChange,
  disabled = false,
}: StudentsFilterProps) => {
  const [showPanel, setShowPanel] = useState(false)

  const handleChange = useCallback(
    (key: keyof StudentsFilterState, value: string) => {
      onFiltersChange({ ...filters, [key]: value })
    },
    [filters, onFiltersChange],
  )

  const isFiltered =
    !!filters.cohort ||
    !!filters.company ||
    !!filters.role ||
    !!filters.nameSearch

  const handleClear = useCallback(() => {
    onFiltersChange({
      cohort: '',
      company: '',
      role: '',
      nameSearch: '',
    })
  }, [onFiltersChange])

  // Redesigned: Inline, pill-based, focus on filter clarity & compact UX
  return (
    <section className="relative flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <TextButton
          className="flex items-center gap-1 text-primary font-semibold text-sm mr-3"
          onClick={() => setShowPanel((v) => !v)}
        >
          <Filter className="size-4" aria-hidden />
          Filters
        </TextButton>
        {isFiltered && (
          <div className="flex gap-1 flex-wrap">
            {filters.nameSearch && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                Name: {filters.nameSearch}
                <button
                  type="button"
                  onClick={() => handleChange('nameSearch', '')}
                  className="ml-1 rounded-full p-0.5 hover:bg-blue-100"
                  disabled={disabled}
                  aria-label="Clear name filter"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            )}
            {filters.cohort && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-200">
                Cohort: {filters.cohort}
                <button
                  type="button"
                  onClick={() => handleChange('cohort', '')}
                  className="ml-1 rounded-full p-0.5 hover:bg-emerald-100"
                  disabled={disabled}
                  aria-label="Clear cohort filter"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            )}
            {filters.company && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
                Company: {filters.company}
                <button
                  type="button"
                  onClick={() => handleChange('company', '')}
                  className="ml-1 rounded-full p-0.5 hover:bg-indigo-100"
                  disabled={disabled}
                  aria-label="Clear company filter"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            )}
            {filters.role && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700 border border-orange-200">
                Role: {filters.role}
                <button
                  type="button"
                  onClick={() => handleChange('role', '')}
                  className="ml-1 rounded-full p-0.5 hover:bg-orange-100"
                  disabled={disabled}
                  aria-label="Clear role filter"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-red-100 hover:text-red-800 transition"
              disabled={disabled}
              aria-label="Clear all filters"
            >
              <X className="size-4" />
              Clear All
            </button>
          </div>
        )}
      </div>
      <div
        id="students-filters-panel"
        aria-label="Student filter controls"
        className={`transition-all duration-300 ${
          showPanel
            ? 'max-h-[400px] opacity-100 pointer-events-auto visible'
            : 'max-h-0 opacity-0 pointer-events-none invisible'
        }`}
      >
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-lg grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="students-filter-name"
              className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500"
            >
              Search by Name
            </label>
            <input
              id="students-filter-name"
              type="search"
              value={filters.nameSearch}
              onChange={(e) => handleChange('nameSearch', e.target.value)}
              placeholder="Student name…"
              className={inputBase}
              disabled={disabled}
            />
          </div>
          <div>
            <label
              htmlFor="students-filter-cohort"
              className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500"
            >
              Cohort
            </label>
            <select
              id="students-filter-cohort"
              value={filters.cohort}
              onChange={(e) => handleChange('cohort', e.target.value)}
              className={selectBase}
              disabled={disabled}
            >
              <option value="">All cohorts</option>
              {options.cohorts.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="students-filter-company"
              className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500"
            >
              Company
            </label>
            <select
              id="students-filter-company"
              value={filters.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className={selectBase}
              disabled={disabled}
            >
              <option value="">All companies</option>
              {options.companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="students-filter-role"
              className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-slate-500"
            >
              Role
            </label>
            <select
              id="students-filter-role"
              value={filters.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className={selectBase}
              disabled={disabled}
            >
              <option value="">All roles</option>
              {options.roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  )
}
