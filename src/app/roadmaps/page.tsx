'use client'

import { ROADMAPS, ROADMAP_META, ROADMAP_SLUGS } from '@/data/roadmaps'
import { PageMain } from '@/templates/PagaMain'
import { PageHeader } from '@/templates/PageHeader'
import { motion } from 'framer-motion'
import { ArrowRight, MessagesSquare } from 'lucide-react'
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-10"
        >
          <Link href="/interview-prep" className="group block">
            <article className="relative overflow-hidden rounded-2xl border border-primary/25 p-6 shadow-lg transition-shadow hover:border-primary/40 hover:shadow-xl sm:p-8">
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                    <MessagesSquare className="size-7" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
                      Interview preparation
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-slate-700 sm:text-2xl">
                      Practice interview questions by topic
                    </h2>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-transform group-hover:gap-3 sm:self-center">
                  Open interview prep
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </article>
          </Link>
        </motion.div>

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
            const isFeatured = slug === 'react'

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
          <div className="col-span-full flex justify-center mt-4">
            <div className="relative w-full max-w-md rounded-2xl border border-dashed border-muted bg-secondary p-4 shadow-lg mx-auto flex items-center gap-4 flex-col sm:flex-row">
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  className="mb-2 text-muted-foreground"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="3"
                    y="10"
                    width="42"
                    height="28"
                    rx="6"
                    fill="#F5F5F5"
                  />
                  <rect
                    x="10"
                    y="17"
                    width="28"
                    height="14"
                    rx="4"
                    fill="#E2E8F0"
                  />
                  <path
                    d="M15 26h18M15 22h18"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="24" cy="34" r="2" fill="#94A3B8" />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  More roadmaps coming soon
                </h3>
                <p className="text-muted-foreground text-sm">
                  We are working hard to bring you new roadmaps! Stay tuned for
                  updates.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageMain>
  )
}
