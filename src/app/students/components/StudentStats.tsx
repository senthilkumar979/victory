'use client'

import { motion } from 'framer-motion'
import { GitCompare, Mars, Users, Venus } from 'lucide-react'

import { AnimatedCounter } from '@/components/profile/AnimatedCounter'
import { ProfileData } from '@/types/student.types'
import { useMemo } from 'react'

interface StatCardProps {
  icon: React.ElementType
  value: number | string
  label: string
  color: string
  iconBg: string
  iconColor: string
  cornerColor: string
  hoverBorder: string
  statColor: string
}

const StatCard = ({
  icon: Icon,
  value,
  label,
  color,
  iconBg,
  iconColor,
  cornerColor,
  hoverBorder,
  statColor,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 120 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${color} p-6 shadow-sm backdrop-blur transition-all ${hoverBorder} hover:shadow-lg hover:shadow-primary/5`}
  >
    <div className="relative z-10">
      <div
        className={`mb-3 inline-flex rounded-xl p-2.5 ${iconBg} ${iconColor}`}
      >
        <Icon className="size-5" />
      </div>
      <div
        className={`text-3xl font-bold tabular-nums text-slate-900 ${statColor}`}
      >
        {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
      </div>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
    <div
      className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${cornerColor} opacity-0 transition-opacity group-hover:opacity-100`}
    />
  </motion.div>
)

const isMale = (g: string | undefined) =>
  g?.toUpperCase() === 'M' || g?.toUpperCase() === 'MALE'
const isFemale = (g: string | undefined) =>
  g?.toUpperCase() === 'F' || g?.toUpperCase() === 'FEMALE'

const formatRatio = (male: number, female: number): string => {
  if (male === 0 && female === 0) return 'N/A'
  if (male === 0) return `0:${female}`
  if (female === 0) return `${male}:0`
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const d = gcd(male, female)
  return `${male / d}:${female / d}`
}

export const StudentStats = ({ students }: { students: ProfileData[] }) => {
  const stats = useMemo(() => {
    const male = students.filter((s) => isMale(s.gender)).length
    const female = students.filter((s) => isFemale(s.gender)).length
    const cohortCounts = students.reduce<Record<string, number>>((acc, s) => {
      const batch = String(s.batch ?? '').trim()
      if (!batch) return acc
      acc[batch] = (acc[batch] ?? 0) + 1
      return acc
    }, {})
    const cohorts = Object.entries(cohortCounts).sort(
      ([a], [b]) => Number(b) - Number(a),
    )

    return {
      total: students.length,
      male,
      female,
      ratio: formatRatio(male, female),
      cohorts,
    }
  }, [students])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      <StatCard
        icon={Users}
        value={stats.total}
        label="Total Students"
        color="from-primary/20 to-primary/5"
        iconBg="bg-primary/10"
        iconColor="text-primary"
        cornerColor="bg-primary/5"
        hoverBorder="hover:border-primary"
        statColor="group-hover:text-primary"
      />
      <StatCard
        icon={Mars}
        value={stats.male}
        label="Male"
        color="from-blue-800/5 to-blue-900/5"
        iconBg="bg-blue-500/10"
        iconColor="text-blue-600"
        cornerColor="bg-blue-500/5"
        hoverBorder="hover:border-blue-500"
        statColor="group-hover:text-blue-600"
      />
      <StatCard
        icon={Venus}
        value={stats.female}
        label="Female"
        color="from-pink-800/5 to-pink-900/5"
        iconBg="bg-pink-500/10"
        iconColor="text-pink-600"
        cornerColor="bg-pink-500/5"
        hoverBorder="hover:border-pink-500"
        statColor="group-hover:text-pink-600"
      />
      <StatCard
        icon={GitCompare}
        value={stats.ratio}
        label="M:F Ratio"
        color="from-violet-800/5 to-violet-900/5"
        iconBg="bg-violet-500/10"
        iconColor="text-violet-600"
        cornerColor="bg-violet-500/5"
        hoverBorder="hover:border-violet-500"
        statColor="group-hover:text-violet-600"
      />
    </motion.div>
  )
}
