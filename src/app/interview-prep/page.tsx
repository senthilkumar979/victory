'use client'

import { listInterviewTracks } from '@/data/interview-prep'
import { PageMain } from '@/templates/PagaMain'
import { PageHeader } from '@/templates/PageHeader'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.12 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function InterviewPrepPage() {
  const tracks = listInterviewTracks()

  return (
    <PageMain>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          title="Interview Preparation"
          description="Practice common interview questions by topic. Swipe the card or use the controls—reveal answers and code when you are ready."
          subtitle="Practice"
        />

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {tracks.map((track) => {
            const Icon = track.icon
            return (
              <motion.div key={track.slug} variants={item}>
                <Link
                  href={`/interview-prep/${track.slug}`}
                  className="group block h-full"
                >
                  <motion.article
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.99 }}
                    className={`relative h-full overflow-hidden rounded-2xl border bg-secondary bg-gradient-to-br ${track.gradient} p-8 shadow-xl backdrop-blur-sm transition-shadow hover:shadow-2xl`}
                  >
                    <div
                      className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/10 opacity-40 blur-2xl"
                      aria-hidden
                    />
                    <div className="relative flex h-full flex-col">
                      <div className="mb-6 flex items-start justify-between">
                        <span
                          className={`flex size-14 items-center justify-center rounded-xl bg-white/5 ${track.accent}`}
                        >
                          <Icon className="size-7" />
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                          {track.questions.length} questions
                        </span>
                      </div>
                      <h2 className="mb-3 text-xl font-bold text-foreground sm:text-2xl">
                        {track.title}
                      </h2>
                      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {track.description}
                      </p>
                      <span
                        className={`inline-flex items-center gap-2 text-sm font-semibold ${track.accent} transition-transform group-hover:gap-3`}
                      >
                        Start practice
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
