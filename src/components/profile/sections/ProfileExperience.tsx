'use client'

import { motion } from 'framer-motion'

import type { Experience } from '@/types/student.types'

interface ProfileExperienceProps {
  experience: Experience[]
}

export const ProfileExperience = ({ experience }: ProfileExperienceProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
  >
    <h2 className="mb-6 text-xl font-semibold text-slate-900">
      Professional Experience
    </h2>
    <div className="space-y-0">
      {experience.map((exp, idx) => (
        <motion.div
          key={`${exp.company}-${exp.role}-${idx}`}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.08 }}
          className="relative border-l-2 border-primary/30 pl-6 pb-8 last:pb-0"
        >
          <span className="absolute -left-[5px] top-2 size-2 rounded-full bg-primary" />
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:border-primary/20">
            <h3 className="font-semibold text-slate-900">{exp.company}</h3>
            <p className="text-sm font-medium text-primary">{exp.role}</p>
            <p className="mt-2 text-sm text-slate-600">{exp.summary}</p>
            {exp.website && (
              <a
                href={exp.website}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-sm text-primary hover:underline"
              >
                {exp.website}
              </a>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </motion.section>
)
