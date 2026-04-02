import type { LucideIcon } from 'lucide-react'

export interface InterviewQuestion {
  id: string
  question: string
  answer: string
  codeExample?: string
  /** Label for the code block, e.g. `java`, `tsx` */
  codeLanguage?: string
}

export interface InterviewTrack {
  slug: string
  title: string
  description: string
  accent: string
  gradient: string
  icon: LucideIcon
  questions: InterviewQuestion[]
}
