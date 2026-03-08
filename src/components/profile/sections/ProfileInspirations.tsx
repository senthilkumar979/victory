'use client'

import { motion } from 'framer-motion'

interface ProfileInspirationsProps {
  inspirations: string[]
}

export const ProfileInspirations = ({ inspirations }: ProfileInspirationsProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
  >
    <h2 className="mb-4 text-xl font-semibold text-slate-900">Inspirations</h2>
    <ul className="space-y-2">
      {inspirations.map((item, idx) => (
        <motion.li
          key={`${item}-${idx}`}
          initial={{ opacity: 0, x: -5 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-2 text-slate-600"
        >
          <span className="size-1.5 rounded-full bg-primary" />
          {item}
        </motion.li>
      ))}
    </ul>
  </motion.section>
)
