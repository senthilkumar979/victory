'use client'

import { motion } from 'framer-motion'
import { Calendar, CalendarDays } from 'lucide-react'

import { AnimatedCounter } from '@/components/profile/AnimatedCounter'
import { useMeetingStats } from '@/hooks/useMeetingStats'

interface StatCardProps {
  icon: React.ElementType
  value: number
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
    className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 h-48 bg-gradient-to-br ${color} p-6 shadow-sm backdrop-blur transition-all ${hoverBorder} hover:shadow-lg hover:shadow-primary/5`}
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
        <AnimatedCounter value={value} />
      </div>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </div>
    <div
      className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${cornerColor} opacity-0 transition-opacity group-hover:opacity-100`}
    />
  </motion.div>
)

export const MeetingStats = () => {
  const {
    totalMeetings,
    meetingsThisMonth,
    meetingsThisWeek,
    isLoading,
    error,
  } = useMeetingStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-200/80 bg-slate-50/50 p-6"
          >
            <div className="mb-3 h-10 w-10 rounded-xl bg-slate-200" />
            <div className="h-8 w-16 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-24 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 px-6 py-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-2"
    >
      <div className="col-span-2">
        <StatCard
          icon={Calendar}
          value={totalMeetings}
          label="Total Meetings"
          color="from-primary/20 to-primary/5"
          iconBg="bg-primary/10"
          iconColor="text-primary"
          cornerColor="bg-primary/5"
          hoverBorder="hover:border-primary"
          statColor="group-hover:text-primary"
        />
      </div>
      <StatCard
        icon={CalendarDays}
        value={meetingsThisMonth}
        label="Meetings This Month"
        color="from-cyan-800/5 to-cyan-900/5"
        iconBg="bg-cyan-500/10"
        iconColor="text-cyan-600"
        cornerColor="bg-cyan-500/5"
        hoverBorder="hover:border-cyan-500"
        statColor="group-hover:text-cyan-600"
      />
      <StatCard
        icon={CalendarDays}
        value={meetingsThisWeek}
        label="Meetings This Week"
        color="from-emerald-800/5 to-emerald-900/5"
        iconBg="bg-emerald-500/10"
        iconColor="text-emerald-600"
        cornerColor="bg-emerald-500/5"
        hoverBorder="hover:border-emerald-500"
        statColor="group-hover:text-emerald-600"
      />
    </motion.div>
  )
}
