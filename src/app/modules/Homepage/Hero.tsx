'use client'

import { cn } from '@/lib/utils'
import { GraduationCap } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { PageMain } from '../../../ui/templates/PagaMain'
import { TransformationBridge } from './TransformationBridge'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 24 },
  },
}

export const Hero = () => (
  <PageMain>
    <section className="relative min-h-[85vh] overflow-hidden bg-[#0b1120] hero-mesh sm:min-h-[88vh] lg:min-h-[90vh]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(6,182,212,0.06),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center lg:items-start lg:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl font-extrabold leading-[1.2] tracking-tight text-primary sm:text-4xl sm:leading-[1.15] md:text-5xl lg:text-6xl"
            >
              Bridging the Gap from{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
                Rural Classrooms
              </span>{' '}
              to Global Tech
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-xl text-base leading-relaxed text-slate-900 sm:mt-6 sm:text-lg"
            >
              Empowering students from rural areas with core tech skills and
              mentorship to land their dream careers.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-4 lg:justify-start"
            >
              <Link
                href="/join"
                className={cn(
                  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary/60 to-primary/90 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 hover:brightness-110 sm:w-auto sm:px-8 sm:py-4',
                )}
              >
                <GraduationCap className="size-5 shrink-0" />
                Join us today!
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative order-first flex min-h-[260px] w-full items-center justify-center overflow-hidden sm:min-h-[300px] sm:order-none lg:min-h-[360px]"
          >
            <TransformationBridge />
          </motion.div>
        </div>
      </div>
    </section>
  </PageMain>
)
