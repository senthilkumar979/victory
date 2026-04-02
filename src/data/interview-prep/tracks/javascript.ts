import { Braces } from 'lucide-react'
import type { InterviewTrack } from '../types'
import { JS_BATCH_1 } from './jsBatch1'
import { JS_BATCH_2 } from './jsBatch2'
import { JS_BATCH_3 } from './jsBatch3'

export const javascriptTrack: InterviewTrack = {
  slug: 'javascript',
  title: 'JavaScript',
  description:
    'One hundred ECMAScript-focused questions: fundamentals, asynchronous programming, objects and modules, and runtime semantics — forty beginner, forty mid-level, and twenty expert.',
  accent: 'text-yellow-400',
  icon: Braces,
  gradient:
    'from-yellow-500/20 via-amber-500/10 to-transparent border border-yellow-500/30',
  questions: [...JS_BATCH_1, ...JS_BATCH_2, ...JS_BATCH_3],
}
