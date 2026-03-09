'use client'

import { motion } from 'framer-motion'
import { Award, BookOpen, Code2, GithubIcon } from 'lucide-react'

import { AnimatedCounter } from '@/components/profile/AnimatedCounter'

interface ProfileStatsProps {
  repositoriesCount: number
  awardsCount: number
  blogsCount: number
  skillsCount: number
}

const statItems = [
  {
    key: 'awards',
    icon: Award,
    label: 'Awards',
    color: 'from-amber-800/5 to-amber-900/5',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    cornerColor: 'bg-amber-500/5',
    hoverBorder: 'hover:border-amber-500',
    statColor: 'group-hover:text-amber-600',
  },
  {
    key: 'blogs',
    icon: BookOpen,
    label: 'Blogs',
    color: 'from-info-800/5 to-info-900/5',
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    cornerColor: 'bg-info/5',
    hoverBorder: 'hover:border-info',
    statColor: 'group-hover:text-info',
  },
  {
    key: 'skills',
    icon: Code2,
    label: 'Skills',
    color: 'from-emerald-800/5 to-emerald-900/5',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600',
    cornerColor: 'bg-emerald-500/5',
    hoverBorder: 'hover:border-success/50',
    statColor: 'group-hover:text-emerald-600',
  },
  {
    key: 'repositories',
    icon: GithubIcon,
    label: 'Repositories',
    color: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    cornerColor: 'bg-primary/5',
    hoverBorder: 'hover:border-primary',
    statColor: 'group-hover:text-primary',
  },
]

export const ProfileStats = ({
  repositoriesCount,
  awardsCount,
  blogsCount,
  skillsCount,
}: ProfileStatsProps) => {
  const values = {
    repositories: repositoriesCount,
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
          transition={{
            delay: 0.4 + idx * 0.06,
            type: 'spring',
            stiffness: 120,
          }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br ${stat.color} p-6 shadow-sm backdrop-blur transition-all ${stat.hoverBorder} hover:shadow-lg hover:shadow-primary/5`}
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
                className={`block ${stat.statColor}`}
              />
            </div>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {stat.label}
            </p>
          </div>
          <div
            className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${stat.cornerColor} opacity-0 transition-opacity group-hover:opacity-100`}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
