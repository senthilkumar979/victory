import { Zap } from 'lucide-react'
import type { InterviewTrack } from '../types'
import { REACT_BATCH_1 } from './reactBatch1'
import { REACT_BATCH_2 } from './reactBatch2'
import { REACT_BATCH_3 } from './reactBatch3'
import { REACT_BATCH_4 } from './reactBatch4'

export const reactTrack: InterviewTrack = {
  slug: 'react',
  title: 'React',
  description:
    'One hundred in-depth interview questions on components, hooks, concurrent React, performance, accessibility, and production patterns.',
  accent: 'text-cyan-400',
  icon: Zap,
  gradient:
    'from-cyan-500/20 via-teal-500/10 to-transparent border border-cyan-500/30',
  questions: [
    ...REACT_BATCH_1,
    ...REACT_BATCH_2,
    ...REACT_BATCH_3,
    ...REACT_BATCH_4,
  ],
}
