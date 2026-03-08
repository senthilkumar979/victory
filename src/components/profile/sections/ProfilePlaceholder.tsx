'use client'

import { motion } from 'framer-motion'

interface ProfilePlaceholderProps {
  title: string
}

export const ProfilePlaceholder = ({ title }: ProfilePlaceholderProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-6 lg:p-8"
  >
    <h2 className="text-xl font-semibold text-slate-600">{title}</h2>
    <p className="mt-2 text-sm text-slate-500">Coming soon</p>
  </motion.section>
)
