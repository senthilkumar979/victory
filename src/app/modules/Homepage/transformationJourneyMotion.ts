import type { Transition, Variants } from 'motion/react'

/** Editorial ease — snappy without harsh stops */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const

export const springSnappy = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
}

export const springSoft = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 32,
}

export const springPop = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 28,
}

export function cardSwapTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.2 }
  return springSnappy
}

export function gridExpandTransition(reduced: boolean): Transition {
  if (reduced) return { duration: 0.2 }
  return { duration: 0.72, ease: easeOutExpo }
}

export function getStudentStagger(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0, delayChildren: 0 },
      },
    }
  }
  return {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.055, delayChildren: 0.08 },
    },
  }
}

export function getStudentLineVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.15 } },
    }
  }
  return {
    hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: springSoft,
    },
  }
}

export function getHiredStagger(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0, delayChildren: 0 },
      },
    }
  }
  return {
    hidden: { opacity: 0, y: 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.07, delayChildren: 0.12 },
    },
  }
}

export function getHiredLineVariants(reduced: boolean): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { duration: 0.15 } },
    }
  }
  return {
    hidden: { opacity: 0, x: 16, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      transition: springSnappy,
    },
  }
}
