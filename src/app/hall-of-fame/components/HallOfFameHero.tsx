'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '../../../ui/templates/PageHeader'

export const HallOfFameHero = () => (
  <motion.header
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: 'easeOut' }}
    className="mb-16 text-center"
  >
    <PageHeader
      title="Hall of Fame"
      description="Celebrating exceptional students who have achieved remarkable success in their careers through dedication, hard work, and the guidance of MentorBridge."
      subtitle="A Legacy of Excellence"
    />
  </motion.header>
)
