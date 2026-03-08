'use client'

import { motion } from 'framer-motion'

interface ProfilePlaceholderProps {
  title: string
}

export const ProfilePlaceholder = ({ title }: ProfilePlaceholderProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/30 py-12">
    <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
      {title}
    </h2>
    <motion.p
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="mt-2 text-xs text-slate-400"
    >
      Coming soon
    </motion.p>
  </div>
)
