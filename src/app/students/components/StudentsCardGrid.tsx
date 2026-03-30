'use client'

import { motion, Variants } from 'framer-motion'
import { AlertCircle, Users } from 'lucide-react'

import type { ProfileData } from '@/types/student.types'

import { StudentCard } from './StudentCard'

interface StudentsCardGridProps {
  students: ProfileData[]
  loading: boolean
  error: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
}

const LoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
  >
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.06, duration: 0.3 }}
        className="relative h-64 w-full overflow-hidden rounded-2xl bg-slate-800 shadow-xl sm:h-72"
      >
        <div className="absolute inset-0 bg-slate-700/80" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />
        <div className="absolute left-4 top-4 h-5 w-32 rounded-lg bg-slate-600" />
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </motion.div>
    ))}
  </motion.div>
)

const ErrorState = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-red-200/80 bg-gradient-to-br from-red-50/90 to-red-50/50 px-8 py-16 text-center shadow-sm"
  >
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 15 }}
    >
      <AlertCircle className="size-14 text-red-500" strokeWidth={1.5} />
    </motion.div>
    <h3 className="mt-4 text-lg font-semibold text-slate-900">
      Unable to load students
    </h3>
    <p className="mt-2 max-w-md text-sm text-slate-600">{message}</p>
  </motion.div>
)

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50/80 to-white px-8 py-20 text-center"
  >
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Users className="size-20 text-slate-300" strokeWidth={1} aria-hidden />
    </motion.div>
    <h3 className="mt-4 text-lg font-semibold text-slate-700">
      No students found
    </h3>
    <p className="mt-2 max-w-sm text-sm text-slate-500">
      Try adjusting your filters or search to find what you&apos;re looking for.
    </p>
  </motion.div>
)

export const StudentsCardGrid = ({
  students,
  loading,
  error,
}: StudentsCardGridProps) => {
  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} />
  if (students.length === 0) return <EmptyState />

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      {students.map((student, index) => (
        <motion.div key={student.id} variants={itemVariants as Variants}>
          <StudentCard student={student} index={index} />
        </motion.div>
      ))}
    </motion.div>
  )
}
