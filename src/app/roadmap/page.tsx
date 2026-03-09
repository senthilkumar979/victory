'use client'

import type React from 'react'
import { ArrowRight, Brackets, Cpu, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ROADMAPS,
  ROADMAP_SLUGS,
  type RoadmapSlug,
} from '@/data/roadmaps'

const ROADMAP_META: Record<
  RoadmapSlug,
  {
    id: string,
    description: string
    accent: string
    icon: React.ComponentType<{ className?: string }>
    gradient: string
  }
> = {
  typescript: {
    id: 'typescript',
    description: 'Type safety, inference, and modern JavaScript tooling.',
    accent: 'text-blue-400',
    icon: Brackets,
    gradient:
      'from-blue-500/20 via-cyan-500/10 to-transparent border border-blue-500/30',
  },
  react: {
    id: 'react',
    description: 'Components, hooks, and the React ecosystem.',
    accent: 'text-cyan-400',
    icon: Zap,
    gradient:
      'from-cyan-500/20 via-teal-500/10 to-transparent border border-cyan-500/30',
  },
  node: {
    id: 'node',
    description: 'Runtime, async patterns, and server-side JavaScript.',
    accent: 'text-emerald-400',
    icon: Cpu,
    gradient:
      'from-emerald-500/20 via-green-500/10 to-transparent border border-emerald-500/30',
  },
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export default function RoadmapPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Ambient background */}
      <div className="profile-hero-mesh pointer-events-none absolute inset-0" />
      <div className="absolute -left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute -right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-info/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
            Learning Paths
          </p>
          <h1
            className="font-bold tracking-tight text-foreground"
            style={{
              fontFamily: '"Bungee Tint", system-ui, sans-serif',
              fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
              lineHeight: 1.1,
              background:
                'linear-gradient(135deg, var(--foreground) 0%, var(--muted-foreground) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Our Roadmaps
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground sm:text-lg">
            Structured, step-by-step guides to master modern web development
            technologies.
          </p>
        </motion.header>

        {/* Bento grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8"
        >
          {ROADMAP_SLUGS.map((slug) => {
            const roadmap = ROADMAPS[slug]
            const meta = ROADMAP_META[slug]
            const Icon = meta.icon
            const isFeatured = slug === 'typescript'

            return (
              <motion.div
                key={slug}
                variants={item}
                className={isFeatured ? 'lg:col-span-2' : 'lg:col-span-1'}
              >
                <Link
                  href={`/roadmap/${meta.id}`}
                  className="group block h-full"
                >
                  <motion.article
                    whileHover={{ y: -6, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative h-full overflow-hidden rounded-2xl border bg-secondary bg-gradient-to-br ${meta.gradient} p-8 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl`}
                  >
                    {/* Decorative corner */}
                    <div
                      className={`absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 opacity-50 blur-2xl`}
                      aria-hidden
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="mb-6 flex items-start justify-between">
                        <span
                          className={`flex size-14 items-center justify-center rounded-xl bg-white/5 ${meta.accent}`}
                        >
                          <Icon className="size-7" />
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                          {roadmap.nodes.length} steps
                        </span>
                      </div>

                      <h2 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
                        {roadmap.title}
                      </h2>
                      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {meta.description}
                      </p>

                      <span
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${meta.accent} transition-transform group-hover:gap-3`}
                      >
                        Start roadmap
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-xs text-muted-foreground"
        >
          Progress is saved locally. Pick any roadmap and track your learning.
        </motion.p>
      </div>
    </motion.main>
  )
}
