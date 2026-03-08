'use client'

import { Download } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileResumeProps {
  resumeLink: string
}

export const ProfileResume = ({ resumeLink }: ProfileResumeProps) => (
  <motion.a
    href={resumeLink}
    target="_blank"
    rel="noreferrer"
    initial={{ opacity: 0, scale: 0.98 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 px-8 py-5 text-base font-semibold text-white shadow-lg shadow-primary/25 transition-shadow hover:shadow-xl hover:shadow-primary/30"
  >
    <Download className="size-5" />
    Download Resume
  </motion.a>
)
