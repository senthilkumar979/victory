'use client'

import { Download } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileResumeProps {
  resumeLink: string
}

export const ProfileResume = ({ resumeLink }: ProfileResumeProps) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.4 }}
    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md lg:p-8"
  >
    <a
      href={resumeLink}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-base font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
    >
      <Download className="size-5" />
      Download Resume
    </a>
  </motion.section>
)
