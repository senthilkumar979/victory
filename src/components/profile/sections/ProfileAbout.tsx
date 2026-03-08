'use client'

import { motion } from 'framer-motion'

interface ProfileAboutProps {
  summary: string
}

export const ProfileAbout = ({ summary }: ProfileAboutProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
  >
    <h2 className="mb-4 text-xl font-semibold text-slate-900">About</h2>
    <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
      {summary}
    </p>
  </motion.section>
)
