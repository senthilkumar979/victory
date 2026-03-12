'use client'

import { ROADMAPS, ROADMAP_META, ROADMAP_SLUGS } from '@/data/roadmaps'
import { PageMain } from '@/templates/PagaMain'
import { PageHeader } from '@/templates/PageHeader'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

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
    <PageMain>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero */}
        <PageHeader
          title="Roadmaps"
          description="Structured, step-by-step guides to master modern web development technologies."
          subtitle="Learning Paths"
        />

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
                  href={`/roadmaps/${meta.id}`}
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
      </div>
    </PageMain>
  )
}
