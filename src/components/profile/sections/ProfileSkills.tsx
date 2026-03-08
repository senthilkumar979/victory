'use client'

import { motion } from 'framer-motion'

interface ProfileSkillsProps {
  skills: string[]
}

export const ProfileSkills = ({ skills }: ProfileSkillsProps) => (
  <div>
    <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
      Skill Sets
    </h2>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, idx) => (
        <motion.span
          key={`${skill}-${idx}`}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.03, type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05 }}
          className="rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 px-4 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 transition-colors hover:ring-primary/30"
        >
          {skill}
        </motion.span>
      ))}
    </div>
  </div>
)
