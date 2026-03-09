'use client'

import { Quote } from 'lucide-react'

interface ProfileAboutProps {
  summary: string
}

export const ProfileAbout = ({ summary }: ProfileAboutProps) => (
  <div className="relative">
    <Quote className=" -left-1 -top-1 size-8 text-primary/20 mb-2" />
    <h2 className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
      About
    </h2>
    <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
      <span dangerouslySetInnerHTML={{ __html: summary }} />
    </p>
  </div>
)
