'use client'

import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileInspirationsProps {
  inspirations: string[]
}

export const ProfileInspirations = ({ inspirations }: ProfileInspirationsProps) => (
  <div>
    <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
      <Sparkles className="size-4" />
      Inspirations
    </h2>
    <ul className="space-y-3">
      {inspirations.map((item, idx) => (
        <motion.li
          key={`${item}-${idx}`}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/5"
        >
          <span className="flex size-1.5 shrink-0 rounded-full bg-primary" />
          <span className="text-slate-700">{item}</span>
        </motion.li>
      ))}
    </ul>
  </div>
)
