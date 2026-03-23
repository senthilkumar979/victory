'use client'

import { PageMain } from '@/ui/templates/PagaMain'
import { PageHeader } from '@/ui/templates/PageHeader'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

import { INTEGRATIONS } from './integrations.data'

export default function IntegrationsPage() {
  return (
    <PageMain>
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <PageHeader
          subtitle="Operations"
          title="Integrations"
          description="Services connected to MentorBridge."
        />
        <ul className="grid gap-4 sm:grid-cols-2">
          {INTEGRATIONS.map((item, i) => (
            <motion.li
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/35 hover:bg-white"
              >
                <span className="flex items-start justify-between gap-3">
                  <span className="font-semibold text-slate-900">
                    {item.name}
                  </span>
                  <ExternalLink
                    className="size-4 shrink-0 text-slate-400 transition-colors group-hover:text-primary"
                    aria-hidden
                  />
                </span>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
                <span className="mt-4 text-sm font-medium text-primary">
                  Open dashboard
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </PageMain>
  )
}
