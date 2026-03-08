'use client'

import { motion } from 'framer-motion'

interface ProfileSkillsProps {
  skills: string[]
}

export const ProfileSkills = ({ skills }: ProfileSkillsProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
  >
    <h2 className="mb-5 text-xl font-semibold text-slate-900">Skill Sets</h2>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => (
        <motion.span
          key={`${skill}-${idx}`}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.03 }}
          className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary"
        >
          {skill}
        </motion.span>
      ))}
    </div>
  </motion.section>
)
