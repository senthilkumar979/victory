'use client'

import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

import type { Experience } from '@/types/student.types'

interface ProfileExperienceProps {
  experience: Experience[]
}

export const ProfileExperience = ({ experience }: ProfileExperienceProps) => (
  <div>
    <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
      Professional Experience
    </h2>
    <div className="space-y-6">
      {experience.map((exp, idx) => (
        <motion.div
          key={`${exp.company}-${exp.role}-${idx}`}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.08 }}
          className="group relative rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-5 transition-all hover:border-primary/20 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">{exp.company}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{exp.role}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {exp.summary}
              </p>
              {exp.website && (
                <a
                  href={exp.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
                >
                  Visit
                  <ArrowUpRight className="size-4" />
                </a>
              )}
            </div>
            <span className="rounded-lg bg-primary/5 px-2 py-1 text-xs font-medium text-primary">
              {idx + 1}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
)
