'use client'

import { PageMain } from '@/ui/templates/PagaMain'
import { motion } from 'framer-motion'

import { QuoteIcon } from 'lucide-react'
import { HallOfFameCriteria } from './components/HallOfFameCriteria'
import { HallOfFameCTA } from './components/HallOfFameCTA'
import { HallOfFameHero } from './components/HallOfFameHero'
import { HallOfFameInductees } from './components/HallOfFameInductees'

export default function HallOfFamePage() {
  return (
    <PageMain>
      <article className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <HallOfFameHero />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-20 rounded-2xl border-2 border-transparent bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:p-8 transition-colors duration-500 relative overflow-hidden"
        >
          <h2 className="mb-4 text-xl text-center font-bold tracking-tight text-slate-900 sm:text-2xl flex items-center justify-between">
            <QuoteIcon className="size-10 text-primary/20" /> A Legacy of
            Excellence
            <span></span>
          </h2>
          <p className="leading-relaxed text-slate-600 italic">
            The Hall of Fame represents the pinnacle of achievement for
            MentorBridge students. Each inductee has demonstrated exceptional
            dedication, skill, and professional growth. Their success stories
            inspire current and future students, proving that with the right
            mentorship and determination, extraordinary career achievements are
            within reach.
          </p>
        </motion.div>

        <HallOfFameCriteria />
        <HallOfFameInductees />
        <HallOfFameCTA />
      </article>
    </PageMain>
  )
}
