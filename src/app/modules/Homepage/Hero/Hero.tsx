'use client'

import { PageMain } from '@/templates/PagaMain'
import { Briefcase, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { PartnersCarousel } from '../../Footer/PartnersCarousel'
import { TransformationBridge } from './TransformationBridge'
import { TransformationBridgeMobile } from './TransformationBridgeMobile'

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
    <section className="relative min-h-[85vh] overflow-hidden bg-[#0b1120] hero-mesh sm:min-h-[98vh] lg:min-h-[90vh]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(6,182,212,0.06),transparent_50%)]" />

      <div className="relative z-10 mx-auto max-w-8xl px-6 py-4 sm:px-6 sm:py-2 lg:pr-12 lg:px-6 lg:py-20">
        <div className="grid items-center gap-50 sm:gap-12 md:gap-16 lg:grid-cols-2 lg:gap-2">
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
              Bridging the Gap from
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 bg-clip-text text-transparent">
                Rural Classrooms
              </span>
              <br />
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
                href="/students"
                className="group inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(213,63,140,0.45)] ring-1 ring-white/20 transition-[box-shadow,filter] duration-300 hover:shadow-[0_12px_28px_-6px_rgba(213,63,140,0.55)] hover:brightness-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
              >
                <Briefcase
                  className="h-4 w-4 opacity-90"
                  aria-hidden
                  strokeWidth={2}
                />
                Hire Talents
                <Sparkles
                  className="h-3.5 w-3.5 opacity-80"
                  aria-hidden
                  strokeWidth={2}
                />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative order-first flex w-full items-center justify-center lg:overflow-hidden min-h-[12vh] sm:order-none lg:min-h-[360px]"
          >
            <div className="contents md:hidden">
              <TransformationBridgeMobile />
            </div>
            <div className="hidden md:contents">
              <TransformationBridge />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="mt-2sm:mt-[150px] lg:mt-[0px]">
        <PartnersCarousel />
      </div>
    </section>
  </PageMain>
)
