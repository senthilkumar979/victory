'use client'

import { Button } from '@/atoms/button/Button'
import { motion } from 'framer-motion'
import Link from 'next/link'

export const HallOfFameCTA = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5 }}
    className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-white to-primary/5 px-6 py-12 text-center shadow-lg sm:px-10 sm:py-16"
  >
    <p className="mx-auto max-w-xl text-lg font-medium italic leading-relaxed text-slate-700 sm:text-xl">
      Excellence is not a destination, it&apos;s a journey.
    </p>
    <div className="mt-8 flex items-center justify-center">
      <Link href="/students">
        <Button size="lg">Explore Student Stories</Button>
      </Link>
    </div>
  </motion.section>
)
