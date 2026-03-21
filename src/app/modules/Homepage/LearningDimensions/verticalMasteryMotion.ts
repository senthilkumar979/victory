import type { Variants } from 'framer-motion'

export const stepContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.14, delayChildren: 0.05 },
  },
}

export const stepItem = (reduce: boolean): Variants => ({
  hidden: { opacity: 0, y: reduce ? 0 : 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
})

export const nodePulse = (reduce: boolean): Variants => ({
  hidden: { scale: 0.85, opacity: 0.6 },
  show: {
    scale: [1, reduce ? 1 : 1.2, 1],
    opacity: 1,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
})
