import { FileCode } from 'lucide-react'
import type { InterviewTrack } from '../types'
import { TS_BATCH_1 } from './tsBatch1'
import { TS_BATCH_2 } from './tsBatch2'
import { TS_BATCH_3 } from './tsBatch3'

export const typescriptTrack: InterviewTrack = {
  slug: 'typescript',
  title: 'TypeScript',
  description:
    'One hundred questions on the type system, compiler options, generics, inference, and production patterns — forty beginner, forty mid-level, and twenty expert, including scenario-based items.',
  accent: 'text-blue-400',
  icon: FileCode,
  gradient:
    'from-blue-500/20 via-sky-500/10 to-transparent border border-blue-500/30',
  questions: [...TS_BATCH_1, ...TS_BATCH_2, ...TS_BATCH_3],
}
