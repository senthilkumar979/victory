import { Coffee } from 'lucide-react'
import type { InterviewTrack } from '../types'
import { CORE_JAVA_BATCH_1 } from './coreJavaBatch1'
import { CORE_JAVA_BATCH_2 } from './coreJavaBatch2'
import { CORE_JAVA_BATCH_3 } from './coreJavaBatch3'
import { CORE_JAVA_BATCH_4 } from './coreJavaBatch4'

export const coreJavaTrack: InterviewTrack = {
  slug: 'core-java',
  title: 'Core Java',
  description:
    'One hundred in-depth interview questions from JVM fundamentals through collections, concurrency, NIO, the memory model, and modern Java — beginner to expert.',
  accent: 'text-orange-400',
  icon: Coffee,
  gradient:
    'from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30',
  questions: [
    ...CORE_JAVA_BATCH_1,
    ...CORE_JAVA_BATCH_2,
    ...CORE_JAVA_BATCH_3,
    ...CORE_JAVA_BATCH_4,
  ],
}
