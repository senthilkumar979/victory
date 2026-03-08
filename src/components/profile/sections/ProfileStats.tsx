'use client'

import { Award, BookOpen, Briefcase, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'

import { AnimatedCounter } from '@/components/profile/AnimatedCounter'

interface ProfileStatsProps {
  experienceCount: number
  awardsCount: number
  blogsCount: number
  skillsCount: number
}

const statItems = [
  {
    key: 'experience',
    icon: Briefcase,
    label: 'Experience',
    color: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  {
    key: 'awards',
    icon: Award,
    label: 'Awards',
    color: 'from-slate-800/5 to-slate-900/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
  },
  {
    key: 'blogs',
    icon: BookOpen,
    label: 'Blogs',
    color: 'from-slate-800/5 to-slate-900/5',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
  },
  {
    key: 'skills',
    icon: Code2,
    label: 'Skills',
    color: 'from-slate-800/5 to-slate-900/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
  },
]

export const ProfileStats = ({
  experienceCount,
  awardsCount,
  blogsCount,
  skillsCount,
}: ProfileStatsProps) => {
  const values = {
    experience: experienceCount,
    awards: awardsCount,
    blogs: blogsCount,
    skills: skillsCount,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {statItems.map((stat, idx) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 + idx * 0.06, type: 'spring', stiffness: 120 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${stat.color} p-6 shadow-sm backdrop-blur transition-all hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5`}
        >
          <div className="relative z-10">
            <div
              className={`mb-3 inline-flex rounded-xl p-2.5 ${stat.iconBg} ${stat.iconColor}`}
            >
              <stat.icon className="size-5" />
            </div>
            <div className="text-3xl font-bold tabular-nums text-slate-900">
              <AnimatedCounter
                value={values[stat.key as keyof typeof values]}
                className="block"
              />
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
          </div>
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>
      ))}
    </motion.div>
  )
}
