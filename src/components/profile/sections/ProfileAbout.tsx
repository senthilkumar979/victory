'use client'

import { Quote } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileAboutProps {
  summary: string
}

export const ProfileAbout = ({ summary }: ProfileAboutProps) => (
  <div className="relative">
    <Quote className="absolute -left-1 -top-1 size-8 text-primary/20" />
    <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
      About
    </h2>
    <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
      {summary}
    </p>
  </div>
)
