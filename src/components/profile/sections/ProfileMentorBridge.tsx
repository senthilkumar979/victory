'use client'

import { Building2 } from 'lucide-react'

import type { MentorBridgeExp } from '@/types/student.types'

interface ProfileMentorBridgeProps {
  exp: MentorBridgeExp
}

export const ProfileMentorBridge = ({ exp }: ProfileMentorBridgeProps) => (
  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-6 ring-1 ring-primary/20">
    <Building2 className="absolute right-4 top-4 size-16 text-primary/10" />
    <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
      MentorBridge Experience
    </h2>
    <h3 className="font-bold text-slate-900">{exp.company}</h3>
    <p className="text-sm font-medium text-primary">{exp.role}</p>
    <p className="mt-3 text-sm text-slate-600">
      <span dangerouslySetInnerHTML={{ __html: exp.summary }} />
    </p>
    {exp.website && (
      <a
        href={exp.website}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
      >
        {exp.website}
      </a>
    )}
  </div>
)
