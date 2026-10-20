import type { Variants } from 'framer-motion'

export const cardVariants = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, scale: reduce ? 1 : 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
})

export const floatLoop = (reduce: boolean) =>
  reduce
    ? false
    : {
        y: [0, -5, 0],
        transition: {
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut' as const,
        },
      }

export const pillarCardHover = (reduce: boolean) =>
  reduce
    ? undefined
    : {
        scale: 1.05,
        boxShadow: '0 0 28px 2px rgba(212, 59, 246, 0.28)',
      }
