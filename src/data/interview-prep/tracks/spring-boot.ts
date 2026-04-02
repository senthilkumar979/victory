import { Leaf } from 'lucide-react'
import type { InterviewTrack } from '../types'
import { SPRING_BOOT_BATCH_1 } from './springBootBatch1'
import { SPRING_BOOT_BATCH_2 } from './springBootBatch2'
import { SPRING_BOOT_BATCH_3 } from './springBootBatch3'
import { SPRING_BOOT_BATCH_4 } from './springBootBatch4'

export const springBootTrack: InterviewTrack = {
  slug: 'spring-boot',
  title: 'Spring Boot',
  description:
    'One hundred practical interview questions on auto-configuration, web APIs, data access, security basics, Actuator, and shipping Boot services — aimed at junior to mid-level developers.',
  accent: 'text-emerald-400',
  icon: Leaf,
  gradient:
    'from-emerald-500/20 via-green-500/10 to-transparent border border-emerald-500/30',
  questions: [
    ...SPRING_BOOT_BATCH_1,
    ...SPRING_BOOT_BATCH_2,
    ...SPRING_BOOT_BATCH_3,
    ...SPRING_BOOT_BATCH_4,
  ],
}
