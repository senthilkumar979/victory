'use client'

import { motion } from 'framer-motion'

type BentoSpan = 'md' | 'lg' | 'xl' | 'full'

interface BentoCardProps {
  children: React.ReactNode
  span?: BentoSpan
  variant?: 'glass' | 'solid' | 'dark'
  className?: string
  delay?: number
}

const spanClasses: Record<BentoSpan, string> = {
  md: 'lg:col-span-1',
  lg: 'lg:col-span-2',
  xl: 'lg:col-span-2 lg:row-span-2 min-h-[320px]',
  full: 'lg:col-span-3',
}

const variantClasses = {
  glass: 'bento-glass',
  solid:
    'border border-slate-200/80 bg-white shadow-lg shadow-slate-200/20',
  dark: 'bg-gradient-to-br from-slate-900 to-slate-800 border border-white/5 text-white shadow-xl',
}

export const BentoCard = ({
  children,
  span = 'md',
  variant = 'glass',
  className = '',
  delay = 0,
}: BentoCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{
      duration: 0.5,
      delay,
      type: 'spring',
      stiffness: 100,
      damping: 20,
    }}
    whileHover={{ y: -2, transition: { duration: 0.2 } }}
    className={`rounded-[1.5rem] p-6 transition-shadow hover:shadow-xl lg:p-8 ${spanClasses[span]} ${variantClasses[variant]} ${className}`}
  >
    {children}
  </motion.div>
)
