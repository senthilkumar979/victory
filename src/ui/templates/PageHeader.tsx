'use client'

import { motion } from 'framer-motion'

export const PageHeader = ({
  title,
  description,
  subtitle,
}: {
  title: string
  description: string
  subtitle: string
}) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-16 text-center"
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
        {subtitle}
      </p>
      <h1
        className="font-bungee-tint font-bold tracking-tight text-primary letter-spacing-wide"
        style={{
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
          lineHeight: 1.1,
          background:
            'linear-gradient(135deg, var(--primary) 0%, var(--primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {title}
      </h1>
      <p className="mt-2 text-slate-600">{description}</p>
    </motion.header>
  )
}
