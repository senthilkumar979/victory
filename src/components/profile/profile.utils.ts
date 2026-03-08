import type { MentorBridgeExp } from '@/types/student.types'

export const hasMentorBridgeExp = (
  exp?: MentorBridgeExp | Record<string, unknown> | null,
): exp is MentorBridgeExp =>
  !!exp &&
  typeof exp === 'object' &&
  'company' in exp &&
  (!!(exp as MentorBridgeExp).company ||
    !!(exp as MentorBridgeExp).role ||
    !!(exp as MentorBridgeExp).summary)
