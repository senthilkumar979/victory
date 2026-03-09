'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Sparkles } from 'lucide-react'

interface ProfileInspirationsProps {
  inspirations: string[]
}

export const ProfileInspirations = ({
  inspirations,
}: ProfileInspirationsProps) => (
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
          className="group flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-2.5 transition-colors hover:border-primary/20 hover:bg-primary/5 w-full"
        >
          <span className="flex size-1.5 shrink-0 rounded-full bg-primary" />
          <a
            href={`https://en.wikipedia.org/wiki/${item}`}
            target="_blank"
            rel="noreferrer"
            className="text-slate-700 group-hover:text-primary flex items-center gap-2 justify-between w-full"
          >
            {item}
            <ExternalLink className="size-3.5 opacity-0 transition-all group-hover:opacity-100" />
          </a>
        </motion.li>
      ))}
    </ul>
  </div>
)
