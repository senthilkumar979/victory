'use client'

import { motion } from 'framer-motion'

import { useStudentsWithFilters } from '@/hooks/useStudentsWithFilters'
import { PageMain } from '@/ui/templates/PagaMain'
import { PageHeader } from '@/ui/templates/PageHeader'

import { StudentsCardGrid } from './components/StudentsCardGrid'
import { StudentsFilter } from './components/StudentsFilter'

export default function StudentsPage() {
  const {
    students,
    loading,
    error,
    filterOptions,
    filters,
    setFilters,
  } = useStudentsWithFilters()

  return (
    <PageMain>
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          title="Students"
          description="Explore our community of talented students and alumni."
          subtitle="Directory"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <StudentsFilter
                filters={filters}
                options={filterOptions}
                onFiltersChange={setFilters}
                disabled={loading}
              />
            </div>
          </div>

          <StudentsCardGrid
            students={students}
            loading={loading}
            error={error}
          />
        </motion.div>
      </div>
    </PageMain>
  )
}
