'use client'

import { motion } from 'framer-motion'

import type { MentorBridgeExp } from '@/types/student.types'

interface ProfileMentorBridgeProps {
  exp: MentorBridgeExp
}

export const ProfileMentorBridge = ({ exp }: ProfileMentorBridgeProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 shadow-md lg:p-8"
  >
    <h2 className="mb-4 text-xl font-semibold text-slate-900">
      MentorBridge Experience
    </h2>
    <div className="rounded-xl border border-primary/20 bg-white p-5">
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
  </motion.section>
)
