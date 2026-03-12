'use client'

import { motion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  className?: string
}

export const AnimatedCounter = ({
  value,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) => {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsub = spring.on('change', (v) => setDisplayValue(Math.round(v)))
    return () => unsub()
  }, [spring])

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className={className}
    >
      {prefix}
      {displayValue}
      {suffix}
    </motion.span>
  )
}
